import { z } from "zod";
import { router, tenantProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const bannerInput = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().url(),
  linkUrl: z.string().url().optional().nullable(),
  position: z.enum(["HOME_HERO", "HOME_SIDEBAR", "HOME_MID", "COMMUNITY_TOP", "EVENT_TOP", "GLOBAL"]).default("HOME_HERO"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
});

export const bannerRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.banner.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        linkUrl: true,
        position: true,
        order: true,
        isActive: true,
        startAt: true,
        endAt: true,
      },
    });
  }),

  activeByPosition: tenantProcedure
    .input(z.object({ position: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return [];

      return db.banner.findMany({
        where: {
          tenantId: ctx.tenantId,
          position: input.position as any,
          isActive: true,
        },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          subtitle: true,
          imageUrl: true,
          linkUrl: true,
        },
      });
    }),

  create: adminProcedure(["ADMIN"])
    .input(bannerInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.banner.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
          startAt: input.startAt ? new Date(input.startAt) : null,
          endAt: input.endAt ? new Date(input.endAt) : null,
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(bannerInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, startAt, endAt, ...data } = input;
      const banner = await db.banner.findUnique({ where: { id } });
      if (!banner || banner.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.banner.update({
        where: { id },
        data: {
          ...data,
          ...(startAt !== undefined ? { startAt: startAt ? new Date(startAt) : null } : {}),
          ...(endAt !== undefined ? { endAt: endAt ? new Date(endAt) : null } : {}),
        },
      });
    }),

  toggleActive: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const banner = await db.banner.findUnique({ where: { id: input.id } });
      if (!banner || banner.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.banner.update({
        where: { id: input.id },
        data: { isActive: !banner.isActive },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const banner = await db.banner.findUnique({ where: { id: input.id } });
      if (!banner || banner.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.banner.delete({ where: { id: input.id } });
    }),
});
