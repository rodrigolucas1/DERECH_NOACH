import { z } from "zod";
import {
  router,
  authenticatedProcedure,
  adminProcedure,
} from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const notificationRouter = router({
  list: authenticatedProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 10;
      const skip = (page - 1) * pageSize;

      const [notifications, total] = await Promise.all([
        db.notification.findMany({
          where: { userId: ctx.userId! },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        db.notification.count({ where: { userId: ctx.userId! } }),
      ]);

      return { notifications, total, page, pageSize };
    }),

  unreadCount: authenticatedProcedure.query(async ({ ctx }) => {
    const count = await db.notification.count({
      where: { userId: ctx.userId!, isRead: false },
    });
    return { count };
  }),

  markRead: authenticatedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return db.notification.updateMany({
        where: { id: input.notificationId, userId: ctx.userId! },
        data: { isRead: true },
      });
    }),

  markAllRead: authenticatedProcedure.mutation(async ({ ctx }) => {
    return db.notification.updateMany({
      where: { userId: ctx.userId!, isRead: false },
      data: { isRead: true },
    });
  }),

  listAll: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.notification.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }),

  create: adminProcedure(["ADMIN"])
    .input(
      z.object({
        userId: z.string(),
        type: z
          .enum([
            "GENERAL",
            "EVENT",
            "STUDY",
            "COMMUNITY",
            "TZEDAKA",
            "FORUM",
            "RABBI",
            "NEWS",
            "PRAYER",
          ])
          .default("GENERAL"),
        title: z.string().min(1),
        message: z.string().min(1),
        link: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado.");
      }

      return db.notification.create({
        data: {
          tenantId: ctx.tenantId,
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          link: input.link,
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(
      z.object({
        id: z.string(),
        type: z
          .enum([
            "GENERAL",
            "EVENT",
            "STUDY",
            "COMMUNITY",
            "TZEDAKA",
            "FORUM",
            "RABBI",
            "NEWS",
            "PRAYER",
          ])
          .optional(),
        title: z.string().min(1).optional(),
        message: z.string().min(1).optional(),
        link: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const notification = await db.notification.findUnique({ where: { id: input.id } });
      if (!notification) throw new Error("Notificação não encontrada.");
      if (notification.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      const { id, ...data } = input;
      return db.notification.update({ where: { id }, data });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const notification = await db.notification.findUnique({ where: { id: input.id } });
      if (!notification) throw new Error("Notificação não encontrada.");
      if (notification.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.notification.delete({ where: { id: input.id } });
    }),

  broadcast: adminProcedure(["ADMIN"])
    .input(
      z.object({
        type: z
          .enum([
            "GENERAL",
            "EVENT",
            "STUDY",
            "COMMUNITY",
            "TZEDAKA",
            "FORUM",
            "RABBI",
            "NEWS",
            "PRAYER",
          ])
          .default("GENERAL"),
        title: z.string().min(1),
        message: z.string().min(1),
        link: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) return { count: 0 };

      const users = await db.tenantMember.findMany({
        where: { tenantId: ctx.tenantId },
        select: { userId: true },
      });

      if (users.length === 0) return { count: 0 };

      await db.notification.createMany({
        data: users.map((u) => ({
          tenantId: ctx.tenantId!,
          userId: u.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          link: input.link,
        })),
      });

      return { count: users.length };
    }),
});
