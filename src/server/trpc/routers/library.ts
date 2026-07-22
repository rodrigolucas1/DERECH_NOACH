import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const libraryItemInput = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  authorId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  materialType: z.enum(["DOCUMENT", "VIDEO", "AUDIO", "LINK"]),
  fileUrl: z.string().url().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  isbn: z.string().optional().nullable(),
  pageCount: z.number().int().positive().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  language: z.string().default("pt-BR"),
  isPublic: z.boolean().default(true),
  tagNames: z.array(z.string()).optional(),
});

export const libraryRouter = router({
  list: tenantProcedure
    .input(
      z.object({
        materialType: z.enum(["DOCUMENT", "VIDEO", "AUDIO", "LINK"]).optional(),
        categoryId: z.string().optional(),
        authorId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return { items: [], nextCursor: null };

      const limit = input?.limit ?? 20;
      const where: any = { tenantId: ctx.tenantId, isPublic: true };
      if (input?.materialType) where.materialType = input.materialType;
      if (input?.categoryId) where.categoryId = input.categoryId;
      if (input?.authorId) where.authorId = input.authorId;
      if (input?.search) where.title = { contains: input.search, mode: "insensitive" };

      const items = await db.libraryItem.findMany({
        where,
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          materialType: true,
          thumbnailUrl: true,
          pageCount: true,
          duration: true,
          downloadCount: true,
          createdAt: true,
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
          tags: { select: { tag: { select: { name: true } } } },
        },
      });

      let nextCursor: string | null = null;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id ?? null;
      }

      return { items, nextCursor };
    }),

  listAll: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.libraryItem.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        materialType: true,
        isPublic: true,
        thumbnailUrl: true,
        downloadCount: true,
        createdAt: true,
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
  }),

  getById: tenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.libraryItem.findUnique({
        where: { id: input.id },
        include: {
          author: { select: { name: true, bio: true, photoUrl: true } },
          category: { select: { name: true, slug: true } },
          tags: { select: { tag: { select: { name: true } } } },
        },
      });
    }),

  categories: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.libraryCategory.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: { select: { items: true } },
      },
    });
  }),

  authors: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.libraryAuthor.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        _count: { select: { items: true } },
      },
    });
  }),

  createCategory: adminProcedure(["ADMIN"])
    .input(z.object({
      name: z.string().min(2),
      slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
      description: z.string().optional(),
      order: z.number().int().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
      return db.libraryCategory.create({ data: { ...input, tenantId: ctx.tenantId } });
    }),

  deleteCategory: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cat = await db.libraryCategory.findUnique({ where: { id: input.id } });
      if (!cat || cat.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.libraryCategory.delete({ where: { id: input.id } });
    }),

  createAuthor: adminProcedure(["ADMIN"])
    .input(z.object({
      name: z.string().min(2),
      bio: z.string().optional(),
      photoUrl: z.string().url().optional().nullable(),
      website: z.string().url().optional().nullable(),
      email: z.string().email().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
      return db.libraryAuthor.create({ data: { ...input, tenantId: ctx.tenantId } });
    }),

  deleteAuthor: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const author = await db.libraryAuthor.findUnique({ where: { id: input.id } });
      if (!author || author.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.libraryAuthor.delete({ where: { id: input.id } });
    }),

  create: adminProcedure(["ADMIN"])
    .input(libraryItemInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const { tagNames, ...itemData } = input;

      const item = await db.libraryItem.create({
        data: { ...itemData, tenantId: ctx.tenantId },
      });

      if (tagNames?.length) {
        for (const tagName of tagNames) {
          const tag = await db.libraryTag.upsert({
            where: { tenantId_name: { tenantId: ctx.tenantId, name: tagName } },
            update: {},
            create: { tenantId: ctx.tenantId, name: tagName },
          });
          await db.libraryItemTag.create({
            data: { itemId: item.id, tagId: tag.id },
          });
        }
      }

      return item;
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(libraryItemInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, tagNames, ...data } = input;
      const item = await db.libraryItem.findUnique({ where: { id } });
      if (!item || item.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      if (tagNames) {
        await db.libraryItemTag.deleteMany({ where: { itemId: id } });
        for (const tagName of tagNames) {
          const tag = await db.libraryTag.upsert({
            where: { tenantId_name: { tenantId: ctx.tenantId, name: tagName } },
            update: {},
            create: { tenantId: ctx.tenantId, name: tagName },
          });
          await db.libraryItemTag.create({ data: { itemId: id, tagId: tag.id } });
        }
      }

      return db.libraryItem.update({ where: { id }, data });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await db.libraryItem.findUnique({ where: { id: input.id } });
      if (!item || item.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.libraryItem.delete({ where: { id: input.id } });
    }),
});
