import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const newsCategoryInput = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  color: z.string().optional().nullable(),
});

const newsArticleInput = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
  tagNames: z.array(z.string()).optional(),
});

export const newsRouter = router({
  list: tenantProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        categoryId: z.string().optional(),
        cursor: z.string().nullish(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return { items: [], nextCursor: null };

      const limit = input?.limit ?? 20;
      const where: any = { tenantId: ctx.tenantId, status: "PUBLISHED" };
      if (input?.categoryId) where.categoryId = input.categoryId;

      const items = await db.newsArticle.findMany({
        where,
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverUrl: true,
          isFeatured: true,
          publishedAt: true,
          author: { select: { name: true, image: true } },
          category: { select: { name: true, color: true, slug: true } },
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

    return db.newsArticle.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isFeatured: true,
        publishedAt: true,
        createdAt: true,
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
  }),

  getBySlug: tenantProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.newsArticle.findUnique({
        where: {
          tenantId_slug: { tenantId: ctx.tenantId, slug: input.slug },
        },
        include: {
          author: { select: { name: true, image: true } },
          category: { select: { name: true, color: true } },
          tags: { select: { tag: { select: { name: true } } } },
          comments: {
            where: { isApproved: true },
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: { select: { name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          _count: { select: { comments: true } },
        },
      });
    }),

  getById: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await db.newsArticle.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          body: true,
          coverUrl: true,
          isFeatured: true,
          categoryId: true,
          tenantId: true,
          tags: { select: { tag: { select: { name: true } } } },
        },
      });
      if (!article) throw new Error("Artigo não encontrado.");
      if (article.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return {
        ...article,
        tagNames: article.tags.map((t) => t.tag.name),
      };
    }),

  categories: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.newsCategory.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: { select: { articles: true } },
      },
    });
  }),

  createCategory: adminProcedure(["ADMIN"])
    .input(newsCategoryInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const existing = await db.newsCategory.findFirst({
        where: { tenantId: ctx.tenantId, slug: input.slug },
      });
      if (existing) throw new Error("Já existe uma categoria com esse slug.");

      return db.newsCategory.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  updateCategory: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(newsCategoryInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const cat = await db.newsCategory.findUnique({ where: { id } });
      if (!cat) throw new Error("Categoria não encontrada.");
      if (cat.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.newsCategory.update({ where: { id }, data });
    }),

  deleteCategory: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cat = await db.newsCategory.findUnique({ where: { id: input.id } });
      if (!cat) throw new Error("Categoria não encontrada.");
      if (cat.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.newsCategory.delete({ where: { id: input.id } });
    }),

  create: adminProcedure(["ADMIN"])
    .input(newsArticleInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const { tagNames, ...articleData } = input;

      const article = await db.newsArticle.create({
        data: {
          ...articleData,
          tenantId: ctx.tenantId,
          authorId: ctx.userId!,
          status: "DRAFT",
        },
      });

      if (tagNames?.length) {
        for (const tagName of tagNames) {
          const tag = await db.newsTag.upsert({
            where: { tenantId_name: { tenantId: ctx.tenantId, name: tagName } },
            update: {},
            create: { tenantId: ctx.tenantId, name: tagName },
          });
          await db.newsArticleTag.create({
            data: { articleId: article.id, tagId: tag.id },
          });
        }
      }

      return article;
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(newsArticleInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, tagNames, ...data } = input;
      const article = await db.newsArticle.findUnique({ where: { id } });
      if (!article) throw new Error("Artigo não encontrado.");
      if (article.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      if (tagNames) {
        await db.newsArticleTag.deleteMany({ where: { articleId: id } });
        for (const tagName of tagNames) {
          const tag = await db.newsTag.upsert({
            where: { tenantId_name: { tenantId: ctx.tenantId, name: tagName } },
            update: {},
            create: { tenantId: ctx.tenantId, name: tagName },
          });
          await db.newsArticleTag.create({
            data: { articleId: id, tagId: tag.id },
          });
        }
      }

      return db.newsArticle.update({ where: { id }, data });
    }),

  publish: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const article = await db.newsArticle.findUnique({ where: { id: input.id } });
      if (!article) throw new Error("Artigo não encontrado.");
      if (article.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.newsArticle.update({
        where: { id: input.id },
        data: {
          status: article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
          publishedAt: article.status !== "PUBLISHED" ? new Date() : null,
        },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const article = await db.newsArticle.findUnique({ where: { id: input.id } });
      if (!article) throw new Error("Artigo não encontrado.");
      if (article.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.newsArticle.delete({ where: { id: input.id } });
    }),
});
