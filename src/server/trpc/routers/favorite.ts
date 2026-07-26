import { z } from "zod";
import { router, authenticatedProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const entityTypeEnum = z.enum(["STUDY", "EVENT", "LIBRARY", "NEWS", "COMMUNITY"]);

export const favoriteRouter = router({
  list: authenticatedProcedure.query(async ({ ctx }) => {
    const favorites = await db.userFavorite.findMany({
      where: { userId: ctx.userId! },
      orderBy: { createdAt: "desc" },
    });

    const grouped: Record<string, string[]> = {};
    for (const f of favorites) {
      if (!grouped[f.entityType]) grouped[f.entityType] = [];
      grouped[f.entityType].push(f.entityId);
    }

    const result: Record<string, { id: string; title: string; thumbnailUrl?: string | null }[]> = {};

    if (grouped.STUDY?.length) {
      const items = await db.studyMaterial.findMany({
        where: { id: { in: grouped.STUDY } },
        select: { id: true, title: true, thumbnailUrl: true },
      });
      result.STUDY = items;
    }

    if (grouped.EVENT?.length) {
      const items = await db.event.findMany({
        where: { id: { in: grouped.EVENT } },
        select: { id: true, title: true, imageUrl: true },
      });
      result.EVENT = items.map((e) => ({ id: e.id, title: e.title, thumbnailUrl: e.imageUrl }));
    }

    if (grouped.LIBRARY?.length) {
      const items = await db.libraryItem.findMany({
        where: { id: { in: grouped.LIBRARY } },
        select: { id: true, title: true, thumbnailUrl: true },
      });
      result.LIBRARY = items;
    }

    if (grouped.NEWS?.length) {
      const items = await db.newsArticle.findMany({
        where: { id: { in: grouped.NEWS } },
        select: { id: true, title: true, coverUrl: true },
      });
      result.NEWS = items.map((n) => ({ id: n.id, title: n.title, thumbnailUrl: n.coverUrl }));
    }

    if (grouped.COMMUNITY?.length) {
      const items = await db.community.findMany({
        where: { id: { in: grouped.COMMUNITY } },
        select: { id: true, name: true, logoUrl: true },
      });
      result.COMMUNITY = items.map((c) => ({ id: c.id, title: c.name, thumbnailUrl: c.logoUrl }));
    }

    return {
      favorites,
      entities: result,
    };
  }),

  check: authenticatedProcedure
    .input(z.object({ entityType: entityTypeEnum, entityId: z.string() }))
    .query(async ({ ctx, input }) => {
      const favorite = await db.userFavorite.findUnique({
        where: {
          userId_entityType_entityId: {
            userId: ctx.userId!,
            entityType: input.entityType,
            entityId: input.entityId,
          },
        },
      });

      return { favorited: !!favorite };
    }),

  toggle: authenticatedProcedure
    .input(z.object({ entityType: entityTypeEnum, entityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.userFavorite.findUnique({
        where: {
          userId_entityType_entityId: {
            userId: ctx.userId!,
            entityType: input.entityType,
            entityId: input.entityId,
          },
        },
      });

      if (existing) {
        await db.userFavorite.delete({ where: { id: existing.id } });
        return { favorited: false };
      }

      await db.userFavorite.create({
        data: {
          userId: ctx.userId!,
          entityType: input.entityType,
          entityId: input.entityId,
        },
      });

      return { favorited: true };
    }),

  remove: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const favorite = await db.userFavorite.findUnique({ where: { id: input.id } });
      if (!favorite) throw new Error("Favorito não encontrado.");
      if (favorite.userId !== ctx.userId) throw new Error("Acesso negado.");

      await db.userFavorite.delete({ where: { id: input.id } });
      return { success: true };
    }),

  listByType: authenticatedProcedure
    .input(z.object({ entityType: entityTypeEnum }))
    .query(async ({ ctx, input }) => {
      return db.userFavorite.findMany({
        where: {
          userId: ctx.userId!,
          entityType: input.entityType,
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
