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

  createUser: adminProcedure(["ADMIN"])
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        role: z.enum(["MEMBER", "LEADER", "ADMIN"]).default("MEMBER"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado.");
      }

      const bcrypt = await import("bcryptjs");
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error("E-mail já cadastrado.");
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await db.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
        },
      });

      await db.tenantMember.create({
        data: {
          tenantId: ctx.tenantId,
          userId: user.id,
          role: input.role,
        },
      });

      return user;
    }),

  updateUser: adminProcedure(["ADMIN"])
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado.");
      }

      const member = await db.tenantMember.findUnique({
        where: {
          tenantId_userId: {
            tenantId: ctx.tenantId,
            userId: input.userId,
          },
        },
      });

      if (!member) {
        throw new Error("Usuário não encontrado neste tenant.");
      }

      const { userId, ...data } = input;
      return db.user.update({
        where: { id: userId },
        data,
      });
    }),

  deactivateUser: adminProcedure(["ADMIN"])
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado.");
      }

      const member = await db.tenantMember.findUnique({
        where: {
          tenantId_userId: {
            tenantId: ctx.tenantId,
            userId: input.userId,
          },
        },
      });

      if (!member) {
        throw new Error("Usuário não encontrado neste tenant.");
      }

      return db.user.update({
        where: { id: input.userId },
        data: { isActive: false },
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
