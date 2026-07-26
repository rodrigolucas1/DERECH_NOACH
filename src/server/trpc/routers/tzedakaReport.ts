import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const tzedakaReportRouter = router({
  list: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.tzedakaReport.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: adminProcedure(["ADMIN"])
    .input(
      z.object({
        title: z.string(),
        summary: z.string().optional(),
        periodStart: z.date(),
        periodEnd: z.date(),
        totalReceived: z.number(),
        totalAllocated: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.tzedakaReport.create({
        data: {
          tenantId: ctx.tenantId,
          title: input.title,
          summary: input.summary,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          totalReceived: input.totalReceived,
          totalAllocated: input.totalAllocated,
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        summary: z.string().optional(),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const report = await db.tzedakaReport.findUnique({
        where: { id: input.id },
      });
      if (!report || report.tenantId !== ctx.tenantId) {
        throw new Error("Relatório não encontrado.");
      }

      const { id, ...data } = input;

      return db.tzedakaReport.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const report = await db.tzedakaReport.findUnique({
        where: { id: input.id },
      });
      if (!report || report.tenantId !== ctx.tenantId) {
        throw new Error("Relatório não encontrado.");
      }

      return db.tzedakaReport.delete({
        where: { id: input.id },
      });
    }),

  published: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.tzedakaReport.findMany({
      where: {
        tenantId: ctx.tenantId,
        publishedAt: { not: null },
      },
      orderBy: { publishedAt: "desc" },
    });
  }),
});
