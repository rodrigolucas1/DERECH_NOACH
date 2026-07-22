import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const settingValueSchema = z.object({
  valueStr: z.string().optional(),
  valueBool: z.boolean().optional(),
  valueInt: z.number().int().optional(),
});

export const tenantSettingRouter = router({
  listByGroup: adminProcedure(["ADMIN"])
    .input(z.object({ group: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.tenantSetting.findMany({
        where: {
          tenantId: ctx.tenantId!,
          group: input.group,
        },
        orderBy: { key: "asc" },
      });
    }),

  get: adminProcedure(["ADMIN"])
    .input(z.object({ group: z.string(), key: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.tenantSetting.findUnique({
        where: {
          tenantId_group_key: {
            tenantId: ctx.tenantId!,
            group: input.group,
            key: input.key,
          },
        },
      });
    }),

  set: adminProcedure(["ADMIN"])
    .input(
      z.object({
        group: z.string(),
        key: z.string(),
        ...settingValueSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { group, key, ...values } = input;
      return db.tenantSetting.upsert({
        where: {
          tenantId_group_key: {
            tenantId: ctx.tenantId!,
            group,
            key,
          },
        },
        create: {
          tenantId: ctx.tenantId!,
          group,
          key,
          ...values,
        },
        update: values,
      });
    }),

  setBulk: adminProcedure(["ADMIN"])
    .input(
      z.object({
        group: z.string(),
        settings: z.array(
          z.object({
            key: z.string(),
            ...settingValueSchema.shape,
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId!;
      const operations = input.settings.map((s) =>
        db.tenantSetting.upsert({
          where: {
            tenantId_group_key: {
              tenantId,
              group: input.group,
              key: s.key,
            },
          },
          create: {
            tenantId,
            group: input.group,
            key: s.key,
            valueStr: s.valueStr,
            valueBool: s.valueBool,
            valueInt: s.valueInt,
          },
          update: {
            valueStr: s.valueStr,
            valueBool: s.valueBool,
            valueInt: s.valueInt,
          },
        })
      );
      return db.$transaction(operations);
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return db.tenantSetting.deleteMany({
        where: {
          id: input.id,
          tenantId: ctx.tenantId!,
        },
      });
    }),
});
