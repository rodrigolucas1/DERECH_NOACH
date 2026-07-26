import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const tzedakaAllocationRouter = router({
  list: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.tzedakaAllocation.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { allocatedAt: "desc" },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });
  }),

  create: adminProcedure(["ADMIN"])
    .input(
      z.object({
        campaignId: z.string().optional(),
        amount: z.number().positive(),
        description: z.string(),
        recipient: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      if (input.campaignId) {
        const campaign = await db.tzedakaCampaign.findUnique({
          where: { id: input.campaignId },
        });
        if (!campaign || campaign.tenantId !== ctx.tenantId) {
          throw new Error("Campanha não encontrada.");
        }
      }

      return db.tzedakaAllocation.create({
        data: {
          tenantId: ctx.tenantId,
          campaignId: input.campaignId,
          amount: input.amount,
          description: input.description,
          recipient: input.recipient,
          allocatedAt: new Date(),
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(
      z.object({
        id: z.string(),
        campaignId: z.string().optional(),
        amount: z.number().positive().optional(),
        description: z.string().optional(),
        recipient: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allocation = await db.tzedakaAllocation.findUnique({
        where: { id: input.id },
      });
      if (!allocation || allocation.tenantId !== ctx.tenantId) {
        throw new Error("Alocação não encontrada.");
      }

      const { id, ...data } = input;

      return db.tzedakaAllocation.update({
        where: { id },
        data,
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const allocation = await db.tzedakaAllocation.findUnique({
        where: { id: input.id },
      });
      if (!allocation || allocation.tenantId !== ctx.tenantId) {
        throw new Error("Alocação não encontrada.");
      }

      return db.tzedakaAllocation.delete({
        where: { id: input.id },
      });
    }),

  summary: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return { totalAllocated: 0, count: 0, byCampaign: [] };

    const allocations = await db.tzedakaAllocation.findMany({
      where: { tenantId: ctx.tenantId },
      select: {
        amount: true,
        campaignId: true,
        campaign: { select: { id: true, title: true } },
      },
    });

    const totalAllocated = allocations.reduce(
      (sum, a) => sum + Number(a.amount),
      0
    );

    const campaignMap = new Map<
      string,
      { campaignId: string; title: string; total: number; count: number }
    >();

    for (const a of allocations) {
      const key = a.campaignId ?? "__none__";
      const existing = campaignMap.get(key);
      if (existing) {
        existing.total += Number(a.amount);
        existing.count += 1;
      } else {
        campaignMap.set(key, {
          campaignId: a.campaignId ?? "",
          title: a.campaign?.title ?? "Sem campanha",
          total: Number(a.amount),
          count: 1,
        });
      }
    }

    return {
      totalAllocated,
      count: allocations.length,
      byCampaign: Array.from(campaignMap.values()),
    };
  }),
});
