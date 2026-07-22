import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const categoryInput = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
});

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

  createCategory: adminProcedure(["ADMIN"])
    .input(categoryInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const slug = toSlug(input.name);

      const existing = await db.forumCategory.findUnique({
        where: { tenantId_slug: { tenantId: ctx.tenantId, slug } },
      });
      if (existing) throw new Error("Já existe uma categoria com esse nome.");

      const maxOrder = await db.forumCategory.aggregate({
        where: { tenantId: ctx.tenantId },
        _max: { order: true },
      });

      return db.forumCategory.create({
        data: {
          name: input.name,
          slug,
          description: input.description ?? null,
          order: (maxOrder._max.order ?? -1) + 1,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateCategory: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(categoryInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const category = await db.forumCategory.findUnique({ where: { id } });
      if (!category || category.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      const slug = data.name ? toSlug(data.name) : category.slug;

      if (data.name) {
        const existing = await db.forumCategory.findUnique({
          where: { tenantId_slug: { tenantId: ctx.tenantId, slug } },
        });
        if (existing && existing.id !== id) throw new Error("Já existe uma categoria com esse nome.");
      }

      return db.forumCategory.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          slug,
          ...(data.description !== undefined ? { description: data.description ?? null } : {}),
        },
      });
    }),

  deleteCategory: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const category = await db.forumCategory.findUnique({ where: { id: input.id } });
      if (!category || category.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.forumCategory.delete({ where: { id: input.id } });
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
