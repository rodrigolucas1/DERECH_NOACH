import { z } from "zod";
import { router, tenantProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const adminRouter = router({
  stats: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) {
      return { users: 0, communities: 0, events: 0, studies: 0 };
    }

    const [users, communities, events, studies] = await Promise.all([
      db.tenantMember.count({ where: { tenantId: ctx.tenantId } }),
      db.community.count({ where: { tenantId: ctx.tenantId } }),
      db.event.count({ where: { tenantId: ctx.tenantId } }),
      db.studyMaterial.count({ where: { tenantId: ctx.tenantId } }),
    ]);

    return { users, communities, events, studies };
  }),

  listUsers: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.tenantMember.findMany({
      where: { tenantId: ctx.tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  }),

  updateUserRole: adminProcedure(["ADMIN"])
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["MEMBER", "LEADER", "ADMIN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado.");
      }

      return db.tenantMember.update({
        where: {
          tenantId_userId: {
            tenantId: ctx.tenantId,
            userId: input.userId,
          },
        },
        data: { role: input.role },
      });
    }),

  getBranding: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return null;

    return db.brandingConfig.findUnique({
      where: { tenantId: ctx.tenantId },
    });
  }),

  updateBranding: adminProcedure(["ADMIN"])
    .input(
      z.object({
        platformName: z.string().optional(),
        logoUrl: z.string().url().optional().nullable(),
        faviconUrl: z.string().url().optional().nullable(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        accentColor: z.string().optional(),
        slogan: z.string().optional().nullable(),
        footerText: z.string().optional().nullable(),
        metaTitle: z.string().optional().nullable(),
        metaDescription: z.string().optional().nullable(),
        ogImageUrl: z.string().url().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado.");
      }

      return db.brandingConfig.upsert({
        where: { tenantId: ctx.tenantId },
        create: { tenantId: ctx.tenantId, ...input },
        update: input,
      });
    }),
});
