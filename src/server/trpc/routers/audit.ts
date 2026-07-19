import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";
import { AuditAction } from "@prisma/client";

export const auditRouter = router({
  logAction: adminProcedure(["ADMIN"])
    .input(
      z.object({
        action: z.nativeEnum(AuditAction),
        entityType: z.string(),
        entityId: z.string().optional(),
        details: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          newValues: input.details ? JSON.stringify(input.details) : null,
          ipAddress: ctx.headers.get("x-forwarded-for") ?? ctx.headers.get("x-real-ip") ?? null,
          userAgent: ctx.headers.get("user-agent") ?? null,
        },
      });
    }),

  listLogs: adminProcedure(["ADMIN"])
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        action: z.nativeEnum(AuditAction).optional(),
        entityType: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        return { logs: [], total: 0, page: input.page, pageSize: input.pageSize };
      }

      const where: Record<string, unknown> = { tenantId: ctx.tenantId };

      if (input.action) {
        where.action = input.action;
      }
      if (input.entityType) {
        where.entityType = input.entityType;
      }
      if (input.userId) {
        where.userId = input.userId;
      }

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        db.auditLog.count({ where }),
      ]);

      return { logs, total, page: input.page, pageSize: input.pageSize };
    }),
});
