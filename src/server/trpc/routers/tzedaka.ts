import { z } from "zod";
import { router, tenantProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const campaignInput = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  goalAmount: z.number().positive().optional(),
  currency: z.string().default("BRL"),
  coverUrl: z.string().url().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  isPublic: z.boolean().default(true),
});

export const tzedakaRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.tzedakaCampaign.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        goalAmount: true,
        currentAmount: true,
        currency: true,
        status: true,
        coverUrl: true,
        startDate: true,
        endDate: true,
        isPublic: true,
        createdAt: true,
        _count: { select: { donations: true } },
      },
    });
  }),

  listPublic: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.tzedakaCampaign.findMany({
      where: { tenantId: ctx.tenantId, isPublic: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        goalAmount: true,
        currentAmount: true,
        currency: true,
        status: true,
        coverUrl: true,
        startDate: true,
        endDate: true,
        _count: { select: { donations: true } },
      },
    });
  }),

  getCampaign: tenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.tzedakaCampaign.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { donations: true } },
        },
      });
    }),

  create: adminProcedure(["ADMIN"])
    .input(campaignInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.tzedakaCampaign.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
          startDate: input.startDate ? new Date(input.startDate) : null,
          endDate: input.endDate ? new Date(input.endDate) : null,
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(campaignInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, startDate, endDate, ...data } = input;
      const campaign = await db.tzedakaCampaign.findUnique({ where: { id } });
      if (!campaign) throw new Error("Campanha não encontrada.");
      if (campaign.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.tzedakaCampaign.update({
        where: { id },
        data: {
          ...data,
          ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
          ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        },
      });
    }),

  updateStatus: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string(), status: z.enum(["ACTIVE", "COMPLETED", "DRAFT", "CANCELLED"]) }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await db.tzedakaCampaign.findUnique({ where: { id: input.id } });
      if (!campaign) throw new Error("Campanha não encontrada.");
      if (campaign.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.tzedakaCampaign.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  togglePublic: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await db.tzedakaCampaign.findUnique({ where: { id: input.id } });
      if (!campaign) throw new Error("Campanha não encontrada.");
      if (campaign.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.tzedakaCampaign.update({
        where: { id: input.id },
        data: { isPublic: !campaign.isPublic },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await db.tzedakaCampaign.findUnique({ where: { id: input.id } });
      if (!campaign) throw new Error("Campanha não encontrada.");
      if (campaign.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.tzedakaCampaign.delete({ where: { id: input.id } });
    }),
});
