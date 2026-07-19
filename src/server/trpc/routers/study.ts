import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const studyCategoryInput = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

const studyMaterialInput = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  materialType: z.enum(["DOCUMENT", "VIDEO", "AUDIO", "LINK"]).default("DOCUMENT"),
  fileUrl: z.string().url().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  isPublic: z.boolean().default(true),
});

export const studyRouter = router({
  list: tenantProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        materialType: z.enum(["DOCUMENT", "VIDEO", "AUDIO", "LINK"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return { items: [], nextCursor: null };

      const limit = input?.limit ?? 20;
      const where: any = { tenantId: ctx.tenantId, isPublic: true };
      if (input?.categoryId) where.categoryId = input.categoryId;
      if (input?.materialType) where.materialType = input.materialType;

      const items = await db.studyMaterial.findMany({
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
          duration: true,
          downloadCount: true,
          createdAt: true,
          category: { select: { name: true, slug: true } },
          uploadedBy: { select: { name: true } },
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

    return db.studyMaterial.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        materialType: true,
        isPublic: true,
        downloadCount: true,
        createdAt: true,
        category: { select: { name: true } },
        uploadedBy: { select: { name: true } },
      },
    });
  }),

  getById: tenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.studyMaterial.findUnique({
        where: { id: input.id },
        include: {
          category: { select: { name: true, slug: true } },
          uploadedBy: { select: { name: true, image: true } },
        },
      });
    }),

  categories: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.studyCategory.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        _count: { select: { materials: true } },
      },
    });
  }),

  createCategory: adminProcedure(["ADMIN"])
    .input(studyCategoryInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const existing = await db.studyCategory.findFirst({
        where: { tenantId: ctx.tenantId, slug: input.slug },
      });
      if (existing) throw new Error("Já existe uma categoria com esse slug.");

      return db.studyCategory.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  updateCategory: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(studyCategoryInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const cat = await db.studyCategory.findUnique({ where: { id } });
      if (!cat) throw new Error("Categoria não encontrada.");
      if (cat.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.studyCategory.update({ where: { id }, data });
    }),

  deleteCategory: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const cat = await db.studyCategory.findUnique({ where: { id: input.id } });
      if (!cat) throw new Error("Categoria não encontrada.");
      if (cat.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.studyCategory.delete({ where: { id: input.id } });
    }),

  create: adminProcedure(["ADMIN"])
    .input(studyMaterialInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.studyMaterial.create({
        data: { ...input, tenantId: ctx.tenantId, uploadedById: ctx.userId! },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(studyMaterialInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const material = await db.studyMaterial.findUnique({ where: { id } });
      if (!material) throw new Error("Material não encontrado.");
      if (material.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.studyMaterial.update({ where: { id }, data });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const material = await db.studyMaterial.findUnique({ where: { id: input.id } });
      if (!material) throw new Error("Material não encontrado.");
      if (material.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.studyMaterial.delete({ where: { id: input.id } });
    }),
});
