import { z } from "zod";
import { router, tenantProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const pageInput = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  body: z.string().min(1),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export const cmsRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.page.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        body: true,
        metaTitle: true,
        metaDescription: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  getBySlug: tenantProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.page.findUnique({
        where: {
          tenantId_slug: { tenantId: ctx.tenantId, slug: input.slug },
        },
      });
    }),

  create: adminProcedure(["ADMIN"])
    .input(pageInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const existing = await db.page.findFirst({
        where: { tenantId: ctx.tenantId, slug: input.slug },
      });
      if (existing) throw new Error("Já existe uma página com esse slug.");

      return db.page.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(pageInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const page = await db.page.findUnique({ where: { id } });
      if (!page || page.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.page.update({ where: { id }, data });
    }),

  togglePublish: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await db.page.findUnique({ where: { id: input.id } });
      if (!page || page.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.page.update({
        where: { id: input.id },
        data: { isPublished: !page.isPublished },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const page = await db.page.findUnique({ where: { id: input.id } });
      if (!page || page.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");
      return db.page.delete({ where: { id: input.id } });
    }),
});
