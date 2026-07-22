import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const rabbiProfileInput = z.object({
  name: z.string().min(2),
  title: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  isPublic: z.boolean().default(true),
});

export const rabbiRouter = router({
  profiles: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.rabbiProfile.findMany({
      where: { tenantId: ctx.tenantId, isPublic: true },
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        photoUrl: true,
        _count: { select: { answers: true } },
      },
    });
  }),

  listAll: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.rabbiProfile.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        photoUrl: true,
        email: true,
        isPublic: true,
        createdAt: true,
        _count: { select: { answers: true } },
      },
    });
  }),

  listQuestions: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.rabbiQuestion.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        question: true,
        category: true,
        status: true,
        isPublic: true,
        createdAt: true,
        user: { select: { name: true } },
        answers: {
          select: {
            id: true,
            answer: true,
            createdAt: true,
            rabbi: { select: { name: true } },
          },
        },
      },
    });
  }),

  publicQuestions: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.rabbiQuestion.findMany({
      where: { tenantId: ctx.tenantId, isPublic: true, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
        answers: {
          select: {
            answer: true,
            createdAt: true,
            rabbi: { select: { name: true } },
          },
          take: 1,
        },
      },
    });
  }),

  createProfile: adminProcedure(["ADMIN"])
    .input(rabbiProfileInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
      return db.rabbiProfile.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  updateProfile: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(rabbiProfileInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const profile = await db.rabbiProfile.findUnique({ where: { id } });
      if (!profile) throw new Error("Perfil não encontrado.");
      if (profile.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.rabbiProfile.update({ where: { id }, data });
    }),

  toggleProfilePublic: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.rabbiProfile.findUnique({ where: { id: input.id } });
      if (!profile) throw new Error("Perfil não encontrado.");
      if (profile.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.rabbiProfile.update({
        where: { id: input.id },
        data: { isPublic: !profile.isPublic },
      });
    }),

  deleteProfile: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await db.rabbiProfile.findUnique({ where: { id: input.id } });
      if (!profile) throw new Error("Perfil não encontrado.");
      if (profile.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.rabbiProfile.delete({ where: { id: input.id } });
    }),

  updateQuestionStatus: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string(), status: z.enum(["PENDING", "PUBLISHED", "REJECTED"]), isPublic: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const question = await db.rabbiQuestion.findUnique({ where: { id: input.id } });
      if (!question) throw new Error("Pergunta não encontrada.");
      if (question.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.rabbiQuestion.update({
        where: { id: input.id },
        data: { status: input.status, ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}) },
      });
    }),

  submitQuestion: authenticatedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        question: z.string().min(10),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.rabbiQuestion.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId!,
          title: input.title,
          question: input.question,
          category: input.category ?? null,
          status: "PENDING",
        },
      });
    }),

  deleteQuestion: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await db.rabbiQuestion.findUnique({ where: { id: input.id } });
      if (!question) throw new Error("Pergunta não encontrada.");
      if (question.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.rabbiQuestion.delete({ where: { id: input.id } });
    }),

  answerQuestion: adminProcedure(["ADMIN"])
    .input(z.object({ questionId: z.string(), rabbiId: z.string(), answer: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const question = await db.rabbiQuestion.findUnique({ where: { id: input.questionId } });
      if (!question) throw new Error("Pergunta não encontrada.");
      if (question.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      const rabbi = await db.rabbiProfile.findUnique({ where: { id: input.rabbiId } });
      if (!rabbi || rabbi.tenantId !== ctx.tenantId) throw new Error("Rabino não encontrado.");

      return db.rabbiAnswer.create({
        data: {
          questionId: input.questionId,
          rabbiId: input.rabbiId,
          answer: input.answer,
          isPublished: true,
        },
      });
    }),
});
