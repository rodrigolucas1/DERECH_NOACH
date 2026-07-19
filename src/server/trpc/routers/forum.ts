import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const forumRouter = router({
  categories: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.forumCategory.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: { select: { topics: true } },
      },
    });
  }),

  topics: tenantProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return [];

      return db.forumTopic.findMany({
        where: { tenantId: ctx.tenantId, categoryId: input.categoryId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          isPinned: true,
          isLocked: true,
          viewCount: true,
          createdAt: true,
          author: { select: { name: true, image: true } },
          _count: { select: { posts: true } },
        },
      });
    }),
});
