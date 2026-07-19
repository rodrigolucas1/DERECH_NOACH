import { z } from "zod";
import { router, publicProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const certificateRouter = router({
  listTemplates: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.certificateTemplate.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        title: true,
        subtitle: true,
        borderStyle: true,
        fontFamily: true,
        primaryColor: true,
        accentColor: true,
        isActive: true,
        _count: { select: { certificates: true } },
      },
    });
  }),

  createTemplate: adminProcedure(["ADMIN"])
    .input(
      z.object({
        name: z.string().min(1),
        title: z.string().min(1),
        subtitle: z.string().optional(),
        borderStyle: z.string().default("classic"),
        fontFamily: z.string().default("serif"),
        primaryColor: z.string().default("#1a56db"),
        accentColor: z.string().default("#f59e0b"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.certificateTemplate.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  deleteTemplate: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await db.certificateTemplate.findUnique({ where: { id: input.id } });
      if (!template) throw new Error("Template não encontrado.");
      if (template.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      const certCount = await db.certificate.count({ where: { templateId: input.id } });
      if (certCount > 0) {
        throw new Error("Não é possível excluir um template que possui certificados emitidos.");
      }

      return db.certificateTemplate.delete({ where: { id: input.id } });
    }),

  listCertificates: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.certificate.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        certificateNumber: true,
        recipientName: true,
        status: true,
        issuedAt: true,
        completionDate: true,
        expiryDate: true,
        template: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }),

  issueCertificate: adminProcedure(["ADMIN"])
    .input(
      z.object({
        templateId: z.string(),
        userId: z.string(),
        recipientName: z.string().min(1),
        eventId: z.string().optional(),
        completionDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const template = await db.certificateTemplate.findUnique({ where: { id: input.templateId } });
      if (!template) throw new Error("Template não encontrado.");
      if (template.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      const user = await db.user.findUnique({ where: { id: input.userId } });
      if (!user) throw new Error("Usuário não encontrado.");

      const certificateNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      return db.certificate.create({
        data: {
          tenantId: ctx.tenantId,
          templateId: input.templateId,
          userId: input.userId,
          recipientName: input.recipientName,
          certificateNumber,
          eventId: input.eventId || null,
          completionDate: input.completionDate ? new Date(input.completionDate) : null,
        },
      });
    }),

  verifyCertificate: publicProcedure
    .input(z.object({ certificateNumber: z.string().min(1) }))
    .query(async ({ input }) => {
      const certificate = await db.certificate.findUnique({
        where: { certificateNumber: input.certificateNumber },
        select: {
          id: true,
          certificateNumber: true,
          recipientName: true,
          status: true,
          issuedAt: true,
          completionDate: true,
          expiryDate: true,
          template: {
            select: {
              name: true,
              title: true,
              subtitle: true,
              borderStyle: true,
              fontFamily: true,
              primaryColor: true,
              accentColor: true,
            },
          },
          user: { select: { name: true, email: true } },
        },
      });

      if (!certificate) {
        throw new Error("Certificado não encontrado.");
      }

      return certificate;
    }),

  myCertificates: authenticatedProcedure.query(async ({ ctx }) => {
    return db.certificate.findMany({
      where: { userId: ctx.userId! },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        certificateNumber: true,
        recipientName: true,
        status: true,
        issuedAt: true,
        completionDate: true,
        template: { select: { id: true, name: true, title: true } },
      },
    });
  }),
});
