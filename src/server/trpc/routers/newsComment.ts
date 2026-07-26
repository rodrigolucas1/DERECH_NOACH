import { z } from "zod";
import {
  router,
  publicProcedure,
  authenticatedProcedure,
  adminProcedure,
} from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const newsCommentRouter = router({
  listByArticle: publicProcedure
    .input(z.object({ articleId: z.string() }))
    .query(async ({ input }) => {
      return db.newsComment.findMany({
        where: {
          articleId: input.articleId,
          isApproved: true,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, name: true, image: true } },
        },
      });
    }),

  listPending: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.newsComment.findMany({
      where: {
        isApproved: false,
        article: { tenantId: ctx.tenantId },
      },
      orderBy: { createdAt: "desc" },
      include: {
        article: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }),

  create: authenticatedProcedure
    .input(
      z.object({
        articleId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const article = await db.newsArticle.findUnique({
        where: { id: input.articleId },
      });
      if (!article) throw new Error("Artigo não encontrado.");

      return db.newsComment.create({
        data: {
          articleId: input.articleId,
          userId: ctx.userId!,
          content: input.content,
          isApproved: false,
        },
      });
    }),

  approve: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await db.newsComment.findUnique({
        where: { id: input.id },
        include: { article: { select: { tenantId: true } } },
      });
      if (!comment || comment.article.tenantId !== ctx.tenantId) {
        throw new Error("Comentário não encontrado.");
      }

      return db.newsComment.update({
        where: { id: input.id },
        data: { isApproved: true },
      });
    }),

  reject: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await db.newsComment.findUnique({
        where: { id: input.id },
        include: { article: { select: { tenantId: true } } },
      });
      if (!comment || comment.article.tenantId !== ctx.tenantId) {
        throw new Error("Comentário não encontrado.");
      }

      return db.newsComment.delete({
        where: { id: input.id },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await db.newsComment.findUnique({
        where: { id: input.id },
        include: { article: { select: { tenantId: true } } },
      });
      if (!comment || comment.article.tenantId !== ctx.tenantId) {
        throw new Error("Comentário não encontrado.");
      }

      return db.newsComment.delete({
        where: { id: input.id },
      });
    }),
});
