import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const partnerRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.partnerInstitution.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        website: true,
        partnershipType: true,
        _count: { select: { representatives: true } },
      },
    });
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.partnerInstitution.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        select: {
          id: true,
          name: true,
          description: true,
          logoUrl: true,
          website: true,
          email: true,
          phone: true,
          address: true,
          partnershipType: true,
          isActive: true,
          createdAt: true,
          representatives: {
            select: { id: true, name: true, role: true, email: true, phone: true },
          },
        },
      });
    }),

  create: adminProcedure(["ADMIN"])
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        logoUrl: z.string().url().optional(),
        website: z.string().url().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        partnershipType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.partnerInstitution.create({
        data: {
          tenantId: ctx.tenantId,
          name: input.name,
          description: input.description ?? null,
          logoUrl: input.logoUrl ?? null,
          website: input.website ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
          address: input.address ?? null,
          partnershipType: input.partnershipType ?? null,
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        logoUrl: z.string().url().optional().nullable(),
        website: z.string().url().optional().nullable(),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        partnershipType: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const institution = await db.partnerInstitution.findUnique({ where: { id } });
      if (!institution) throw new Error("Instituição não encontrada.");
      if (institution.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.partnerInstitution.update({ where: { id }, data });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const institution = await db.partnerInstitution.findUnique({ where: { id: input.id } });
      if (!institution) throw new Error("Instituição não encontrada.");
      if (institution.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.partnerInstitution.delete({ where: { id: input.id } });
    }),

  addRepresentative: adminProcedure(["ADMIN"])
    .input(
      z.object({
        institutionId: z.string(),
        name: z.string().min(2),
        role: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const institution = await db.partnerInstitution.findUnique({ where: { id: input.institutionId } });
      if (!institution) throw new Error("Instituição não encontrada.");
      if (institution.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.institutionRepresentative.create({
        data: {
          institutionId: input.institutionId,
          name: input.name,
          role: input.role ?? null,
          email: input.email ?? null,
          phone: input.phone ?? null,
        },
      });
    }),

  removeRepresentative: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const representative = await db.institutionRepresentative.findUnique({ where: { id: input.id } });
      if (!representative) throw new Error("Representante não encontrado.");

      const institution = await db.partnerInstitution.findUnique({ where: { id: representative.institutionId } });
      if (!institution || institution.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.institutionRepresentative.delete({ where: { id: input.id } });
    }),
});
