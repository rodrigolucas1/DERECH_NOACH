import { z } from "zod";
import { router, publicProcedure, authenticatedProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const searchRouter = router({
  global: authenticatedProcedure
    .input(z.object({ query: z.string().min(1), module: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const q = input.query;

      const whereClause = (extra?: Record<string, any>) => ({
        ...extra,
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      });

      const moduleFilter = input.module?.toUpperCase();

      const studies =
        !moduleFilter || moduleFilter === "STUDY"
          ? db.studyMaterial.findMany({
              where: whereClause({ tenantId: ctx.tenantId, isPublic: true }),
              select: { id: true, title: true, description: true, thumbnailUrl: true, materialType: true },
              take: 10,
            })
          : Promise.resolve([]);

      const events =
        !moduleFilter || moduleFilter === "EVENT"
          ? db.event.findMany({
              where: whereClause({ tenantId: ctx.tenantId, isActive: true }),
              select: { id: true, title: true, description: true, imageUrl: true, dateTime: true },
              take: 10,
            })
          : Promise.resolve([]);

      const library =
        !moduleFilter || moduleFilter === "LIBRARY"
          ? db.libraryItem.findMany({
              where: whereClause({ tenantId: ctx.tenantId, isPublic: true }),
              select: { id: true, title: true, description: true, thumbnailUrl: true, materialType: true },
              take: 10,
            })
          : Promise.resolve([]);

      const news =
        !moduleFilter || moduleFilter === "NEWS"
          ? db.newsArticle.findMany({
              where: {
                tenantId: ctx.tenantId,
                status: "PUBLISHED",
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { excerpt: { contains: q, mode: "insensitive" } },
                ],
              },
              select: { id: true, title: true, excerpt: true, coverUrl: true, publishedAt: true },
              take: 10,
            })
          : Promise.resolve([]);

      const community =
        !moduleFilter || moduleFilter === "COMMUNITY"
          ? db.community.findMany({
              where: whereClause({ tenantId: ctx.tenantId, isActive: true }),
              select: { id: true, name: true, description: true, logoUrl: true, city: true },
              take: 10,
            })
          : Promise.resolve([]);

      const [studiesResult, eventsResult, libraryResult, newsResult, communityResult] =
        await Promise.all([studies, events, library, news, community]);

      const totalResults =
        studiesResult.length + eventsResult.length + libraryResult.length + newsResult.length + communityResult.length;

      await db.searchHistory.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId!,
          query: q,
          module: input.module ?? null,
          resultsCount: totalResults,
        },
      });

      return {
        studies: studiesResult,
        events: eventsResult,
        library: libraryResult,
        news: newsResult,
        community: communityResult,
        totalResults,
      };
    }),

  history: authenticatedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;

      return db.searchHistory.findMany({
        where: { userId: ctx.userId! },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, query: true, module: true, resultsCount: true, createdAt: true },
      });
    }),

  clearHistory: authenticatedProcedure.mutation(async ({ ctx }) => {
    await db.searchHistory.deleteMany({ where: { userId: ctx.userId! } });
    return { success: true };
  }),

  deleteHistoryItem: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await db.searchHistory.findUnique({ where: { id: input.id } });
      if (!item) throw new Error("Item não encontrado.");
      if (item.userId !== ctx.userId) throw new Error("Acesso negado.");

      await db.searchHistory.delete({ where: { id: input.id } });
      return { success: true };
    }),

  popular: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;

      const results = await db.searchHistory.groupBy({
        by: ["query"],
        where: ctx.tenantId ? { tenantId: ctx.tenantId } : undefined,
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: limit,
      });

      return results.map((r) => ({
        query: r.query,
        count: r._count.query,
      }));
    }),
});
