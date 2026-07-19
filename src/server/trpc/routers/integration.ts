import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";
import { getIntegrationAdapter, getAllAdapters } from "@/server/services/integrations";

export const integrationRouter = router({
  listAvailable: adminProcedure(["ADMIN"]).query(() => {
    return getAllAdapters().map((a) => ({
      name: a.name,
      displayName: a.displayName,
      description: a.description,
      icon: a.icon,
      configFields: a.configFields,
    }));
  }),

  list: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    return db.integrationConfig.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { provider: "asc" },
    });
  }),

  getByService: adminProcedure(["ADMIN"])
    .input(z.object({ service: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;
      return db.integrationConfig.findUnique({
        where: {
          tenantId_provider: { tenantId: ctx.tenantId, provider: input.service },
        },
      });
    }),

  upsert: adminProcedure(["ADMIN"])
    .input(
      z.object({
        service: z.string().min(1),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        webhookUrl: z.string().optional(),
        extraConfig: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
      return db.integrationConfig.upsert({
        where: {
          tenantId_provider: { tenantId: ctx.tenantId, provider: input.service },
        },
        create: {
          tenantId: ctx.tenantId,
          provider: input.service,
          apiKey: input.apiKey,
          apiSecret: input.apiSecret,
          webhookUrl: input.webhookUrl,
          extraConfig: input.extraConfig,
          isActive: input.isActive,
        },
        update: {
          apiKey: input.apiKey,
          apiSecret: input.apiSecret,
          webhookUrl: input.webhookUrl,
          extraConfig: input.extraConfig,
          isActive: input.isActive,
        },
      });
    }),

  toggleActive: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
      const record = await db.integrationConfig.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!record) throw new Error("Integração não encontrada.");
      return db.integrationConfig.update({
        where: { id: record.id },
        data: { isActive: !record.isActive },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
      const record = await db.integrationConfig.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!record) throw new Error("Integração não encontrada.");
      return db.integrationConfig.delete({ where: { id: record.id } });
    }),

  testConnection: adminProcedure(["ADMIN"])
    .input(z.object({ service: z.string() }))
    .mutation(async ({ input }) => {
      const adapter = getIntegrationAdapter(input.service);
      if (!adapter) throw new Error("Serviço de integração não encontrado.");
      return adapter.testConnection({});
    }),
});
