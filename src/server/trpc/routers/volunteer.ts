import { z } from "zod";
import { router, publicProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const volunteerRouter = router({
  opportunityList: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.volunteerOpportunity.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        location: true,
        startDate: true,
        endDate: true,
        maxVolunteers: true,
        createdAt: true,
        _count: { select: { signups: true } },
      },
    });
  }),

  opportunityGet: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.volunteerOpportunity.findUnique({
        where: { id: input.id },
        include: {
          signups: {
            orderBy: { signedUpAt: "asc" },
            select: {
              id: true,
              status: true,
              hoursLogged: true,
              notes: true,
              signedUpAt: true,
              user: { select: { id: true, name: true, image: true } },
            },
          },
          _count: { select: { signups: true } },
        },
      });
    }),

  opportunityCreate: adminProcedure(["ADMIN", "LEADER"])
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        requirements: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        maxVolunteers: z.number().int().positive().optional(),
        communityId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.volunteerOpportunity.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        },
      });
    }),

  opportunityUpdate: adminProcedure(["ADMIN", "LEADER"])
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        requirements: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        maxVolunteers: z.number().int().positive().optional(),
        communityId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, startDate, endDate, ...data } = input;

      const opportunity = await db.volunteerOpportunity.findUnique({ where: { id } });
      if (!opportunity) throw new Error("Oportunidade não encontrada.");
      if (opportunity.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.volunteerOpportunity.update({
        where: { id },
        data: {
          ...data,
          ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
          ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        },
      });
    }),

  opportunityDelete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const opportunity = await db.volunteerOpportunity.findUnique({ where: { id: input.id } });
      if (!opportunity) throw new Error("Oportunidade não encontrada.");
      if (opportunity.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.volunteerOpportunity.delete({ where: { id: input.id } });
    }),

  signup: authenticatedProcedure
    .input(
      z.object({
        opportunityId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const opportunity = await db.volunteerOpportunity.findUnique({
        where: { id: input.opportunityId },
        include: { _count: { select: { signups: true } } },
      });
      if (!opportunity) throw new Error("Oportunidade não encontrada.");
      if (!opportunity.isActive) throw new Error("Oportunidade não está ativa.");

      if (opportunity.maxVolunteers && opportunity._count.signups >= opportunity.maxVolunteers) {
        throw new Error("Vagas esgotadas.");
      }

      const existing = await db.volunteerSignup.findUnique({
        where: { opportunityId_userId: { opportunityId: input.opportunityId, userId: ctx.userId! } },
      });
      if (existing) throw new Error("Você já está inscrito nesta oportunidade.");

      return db.volunteerSignup.create({
        data: {
          opportunityId: input.opportunityId,
          userId: ctx.userId!,
          notes: input.notes,
        },
      });
    }),

  cancelSignup: authenticatedProcedure
    .input(z.object({ signupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const signup = await db.volunteerSignup.findUnique({ where: { id: input.signupId } });
      if (!signup) throw new Error("Inscrição não encontrada.");
      if (signup.userId !== ctx.userId) throw new Error("Acesso negado.");

      return db.volunteerSignup.delete({ where: { id: input.signupId } });
    }),

  listMySignups: authenticatedProcedure.query(async ({ ctx }) => {
    return db.volunteerSignup.findMany({
      where: { userId: ctx.userId! },
      orderBy: { signedUpAt: "desc" },
      select: {
        id: true,
        status: true,
        hoursLogged: true,
        notes: true,
        signedUpAt: true,
        opportunity: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }),

  updateSignupStatus: adminProcedure(["ADMIN", "LEADER"])
    .input(
      z.object({
        signupId: z.string(),
        status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
        hoursLogged: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { signupId, ...data } = input;

      const signup = await db.volunteerSignup.findUnique({
        where: { id: signupId },
        include: { opportunity: true },
      });
      if (!signup) throw new Error("Inscrição não encontrada.");
      if (signup.opportunity.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.volunteerSignup.update({
        where: { id: signupId },
        data,
      });
    }),
});
