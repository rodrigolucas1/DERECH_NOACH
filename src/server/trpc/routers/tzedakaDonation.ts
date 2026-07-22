import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const tzedakaDonationRouter = router({
  listByCampaign: tenantProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return [];

      const isAdmin = ctx.userRole === "ADMIN";

      return db.tzedakaDonation.findMany({
        where: {
          tenantId: ctx.tenantId,
          campaignId: input.campaignId,
          ...(isAdmin ? {} : { status: "COMPLETED" }),
        },
        orderBy: { donatedAt: "desc" },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          donorName: true,
          isAnonymous: true,
          message: true,
          donatedAt: true,
          user: { select: { id: true, name: true, image: true } },
        },
      });
    }),

  myDonations: authenticatedProcedure.query(async ({ ctx }) => {
    return db.tzedakaDonation.findMany({
      where: { userId: ctx.userId! },
      orderBy: { donatedAt: "desc" },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        donorName: true,
        isAnonymous: true,
        message: true,
        donatedAt: true,
        campaign: { select: { id: true, title: true } },
      },
    });
  }),

  create: authenticatedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        amount: z.number().positive(),
        donorName: z.string().optional(),
        isAnonymous: z.boolean().default(false),
        message: z.string().optional(),
        paymentMethod: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const campaign = await db.tzedakaCampaign.findUnique({ where: { id: input.campaignId } });
      if (!campaign || campaign.tenantId !== ctx.tenantId) throw new Error("Campanha não encontrada.");

      const [donation] = await db.$transaction([
        db.tzedakaDonation.create({
          data: {
            campaignId: input.campaignId,
            tenantId: ctx.tenantId,
            userId: ctx.userId!,
            amount: input.amount,
            donorName: input.donorName,
            isAnonymous: input.isAnonymous,
            message: input.message,
            paymentMethod: input.paymentMethod,
            status: "PENDING",
          },
        }),
        db.tzedakaCampaign.update({
          where: { id: input.campaignId },
          data: { currentAmount: { increment: input.amount } },
        }),
      ]);

      return donation;
    }),

  updateStatus: adminProcedure(["ADMIN"])
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const donation = await db.tzedakaDonation.findUnique({ where: { id: input.id } });
      if (!donation || donation.tenantId !== ctx.tenantId) throw new Error("Doação não encontrada.");

      const amount = Number(donation.amount);

      if (donation.status === "COMPLETED" && input.status !== "COMPLETED") {
        await db.tzedakaCampaign.update({
          where: { id: donation.campaignId! },
          data: { currentAmount: { decrement: amount } },
        });
      } else if (donation.status !== "COMPLETED" && input.status === "COMPLETED") {
        await db.tzedakaCampaign.update({
          where: { id: donation.campaignId! },
          data: { currentAmount: { increment: amount } },
        });
      }

      return db.tzedakaDonation.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
