import { z } from "zod";
import { router, publicProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const galleryRouter = router({
  albumList: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.galleryAlbum.findMany({
      where: { tenantId: ctx.tenantId, isPublic: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        coverUrl: true,
        isPublic: true,
        createdAt: true,
        community: { select: { name: true, slug: true } },
        _count: { select: { media: true } },
      },
    });
  }),

  albumGet: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.galleryAlbum.findUnique({
        where: { id: input.id },
        include: {
          media: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              type: true,
              url: true,
              thumbnailUrl: true,
              title: true,
              caption: true,
              width: true,
              height: true,
              duration: true,
              createdAt: true,
            },
          },
          community: { select: { name: true, slug: true } },
          _count: { select: { media: true } },
        },
      });
    }),

  albumCreate: adminProcedure(["ADMIN", "LEADER"])
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        communityId: z.string().optional().nullable(),
        coverUrl: z.string().optional().nullable(),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.galleryAlbum.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  albumUpdate: adminProcedure(["ADMIN", "LEADER"])
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        coverUrl: z.string().optional().nullable(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const album = await db.galleryAlbum.findUnique({ where: { id } });
      if (!album) throw new Error("Álbum não encontrado.");
      if (album.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.galleryAlbum.update({
        where: { id },
        data,
      });
    }),

  albumDelete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const album = await db.galleryAlbum.findUnique({ where: { id: input.id } });
      if (!album) throw new Error("Álbum não encontrado.");
      if (album.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      await db.galleryMedia.deleteMany({ where: { albumId: input.id } });

      return db.galleryAlbum.delete({ where: { id: input.id } });
    }),

  mediaAdd: adminProcedure(["ADMIN", "LEADER"])
    .input(
      z.object({
        albumId: z.string(),
        url: z.string().url(),
        type: z.enum(["IMAGE", "VIDEO"]),
        title: z.string().optional(),
        caption: z.string().optional(),
        thumbnailUrl: z.string().optional().nullable(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        duration: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const album = await db.galleryAlbum.findUnique({ where: { id: input.albumId } });
      if (!album) throw new Error("Álbum não encontrado.");
      if (album.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.galleryMedia.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
          uploadedById: ctx.userId!,
        },
      });
    }),

  mediaDelete: adminProcedure(["ADMIN", "LEADER"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const media = await db.galleryMedia.findUnique({ where: { id: input.id } });
      if (!media) throw new Error("Mídia não encontrada.");
      if (media.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.galleryMedia.delete({ where: { id: input.id } });
    }),

  mediaUpdate: adminProcedure(["ADMIN", "LEADER"])
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const media = await db.galleryMedia.findUnique({ where: { id } });
      if (!media) throw new Error("Mídia não encontrada.");
      if (media.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.galleryMedia.update({
        where: { id },
        data,
      });
    }),
});
