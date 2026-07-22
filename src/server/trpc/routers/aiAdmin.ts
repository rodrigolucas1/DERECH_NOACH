import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const aiAdminRouter = router({
  getConfig: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return null;

    return db.aIConfig.findUnique({
      where: { tenantId: ctx.tenantId },
    });
  }),

  upsertConfig: adminProcedure(["ADMIN"])
    .input(
      z.object({
        apiKey: z.string().optional(),
        model: z.string().default("gpt-4o-mini"),
        systemPrompt: z.string().optional(),
        maxTokens: z.number().default(1000),
        temperature: z.number().default(0.7),
        isEnabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado.");
      }

      return db.aIConfig.upsert({
        where: { tenantId: ctx.tenantId },
        create: { tenantId: ctx.tenantId, ...input },
        update: input,
      });
    }),

  getUsageLogs: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.aIUsageLog.findMany({
      where: { tenantId: ctx.tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }),

  getUsageStats: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        successRate: 0,
        avgLatency: 0,
      };
    }

    const logs = await db.aIUsageLog.findMany({
      where: { tenantId: ctx.tenantId },
      select: {
        totalTokens: true,
        latencyMs: true,
        success: true,
      },
    });

    const totalRequests = logs.length;
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const successCount = logs.filter((log) => log.success).length;
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;
    const latencyLogs = logs.filter((log) => log.latencyMs !== null);
    const avgLatency =
      latencyLogs.length > 0
        ? latencyLogs.reduce((sum, log) => sum + (log.latencyMs ?? 0), 0) / latencyLogs.length
        : 0;

    return {
      totalRequests,
      totalTokens,
      successRate: Math.round(successRate * 100) / 100,
      avgLatency: Math.round(avgLatency),
    };
  }),
});
