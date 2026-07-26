import { z } from "zod";
import { router, publicProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const mentorshipRouter = router({
  mentorList: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.mentorProfile.findMany({
      where: { tenantId: ctx.tenantId, isAvailable: true },
      select: {
        id: true,
        expertise: true,
        bio: true,
        isAvailable: true,
        maxMentees: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }),

  mentorGet: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.mentorProfile.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        select: {
          id: true,
          expertise: true,
          bio: true,
          isAvailable: true,
          maxMentees: true,
          createdAt: true,
          user: { select: { id: true, name: true, image: true } },
        },
      });
    }),

  mentorCreate: authenticatedProcedure
    .input(
      z.object({
        expertise: z.string().optional(),
        bio: z.string().optional(),
        maxMentees: z.number().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const existing = await db.mentorProfile.findUnique({
        where: { tenantId_userId: { tenantId: ctx.tenantId, userId: ctx.userId! } },
      });
      if (existing) throw new Error("Você já possui perfil de mentor.");

      return db.mentorProfile.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId!,
          expertise: input.expertise ?? null,
          bio: input.bio ?? null,
          maxMentees: input.maxMentees ?? 3,
        },
      });
    }),

  mentorUpdate: authenticatedProcedure
    .input(
      z.object({
        expertise: z.string().optional(),
        bio: z.string().optional(),
        isAvailable: z.boolean().optional(),
        maxMentees: z.number().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.mentorProfile.findUnique({
        where: { tenantId_userId: { tenantId: ctx.tenantId!, userId: ctx.userId! } },
      });
      if (!profile) throw new Error("Perfil de mentor não encontrado.");

      return db.mentorProfile.update({
        where: { id: profile.id },
        data: {
          ...(input.expertise !== undefined && { expertise: input.expertise }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(input.isAvailable !== undefined && { isAvailable: input.isAvailable }),
          ...(input.maxMentees !== undefined && { maxMentees: input.maxMentees }),
        },
      });
    }),

  mentorDelete: authenticatedProcedure.mutation(async ({ ctx }) => {
    const profile = await db.mentorProfile.findUnique({
      where: { tenantId_userId: { tenantId: ctx.tenantId!, userId: ctx.userId! } },
    });
    if (!profile) throw new Error("Perfil de mentor não encontrado.");

    return db.mentorProfile.delete({ where: { id: profile.id } });
  }),

  mentorListAll: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.mentorProfile.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        expertise: true,
        bio: true,
        isAvailable: true,
        maxMentees: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }),

  requestMentorship: authenticatedProcedure
    .input(z.object({ mentorId: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const mentorProfile = await db.mentorProfile.findUnique({ where: { id: input.mentorId } });
      if (!mentorProfile || mentorProfile.tenantId !== ctx.tenantId) {
        throw new Error("Mentor não encontrado.");
      }
      if (!mentorProfile.isAvailable) throw new Error("Mentor não está disponível.");

      const activeCount = await db.mentorship.count({
        where: { mentorId: mentorProfile.userId, status: "ACTIVE" },
      });
      if (activeCount >= mentorProfile.maxMentees) {
        throw new Error("Mentor atingiu o número máximo de mentorados.");
      }

      const existing = await db.mentorship.findUnique({
        where: { tenantId_mentorId_menteeId: { tenantId: ctx.tenantId, mentorId: mentorProfile.userId, menteeId: ctx.userId! } },
      });
      if (existing) throw new Error("Você já possui uma mentoria com este mentor.");

      return db.mentorship.create({
        data: {
          tenantId: ctx.tenantId,
          mentorId: mentorProfile.userId,
          menteeId: ctx.userId!,
          notes: input.notes ?? null,
          status: "ACTIVE",
        },
      });
    }),

  listMyMentorships: authenticatedProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.mentorship.findMany({
      where: {
        tenantId: ctx.tenantId,
        OR: [{ mentorId: ctx.userId! }, { menteeId: ctx.userId! }],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        notes: true,
        mentor: { select: { id: true, name: true, image: true } },
        mentee: { select: { id: true, name: true, image: true } },
      },
    });
  }),

  updateMentorshipStatus: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mentorship = await db.mentorship.findUnique({ where: { id: input.id } });
      if (!mentorship) throw new Error("Mentoria não encontrada.");
      if (mentorship.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      if (mentorship.mentorId !== ctx.userId && mentorship.menteeId !== ctx.userId) {
        throw new Error("Você não participa desta mentoria.");
      }

      return db.mentorship.update({
        where: { id: input.id },
        data: {
          status: input.status,
          ...(input.endDate !== undefined && { endDate: input.endDate }),
        },
      });
    }),

  deleteMentorship: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mentorship = await db.mentorship.findUnique({ where: { id: input.id } });
      if (!mentorship) throw new Error("Mentoria não encontrada.");
      if (mentorship.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      if (mentorship.mentorId !== ctx.userId && mentorship.menteeId !== ctx.userId) {
        throw new Error("Você não participa desta mentoria.");
      }

      return db.mentorship.delete({ where: { id: input.id } });
    }),
});
