import { z } from "zod";
import { router, publicProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const prayerRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.prayerRequest.findMany({
      where: { tenantId: ctx.tenantId, isPublic: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        isAnonymous: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { responses: true } },
      },
    });
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.prayerRequest.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          isAnonymous: true,
          isPublic: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, name: true, image: true } },
          responses: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              message: true,
              createdAt: true,
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
      });
    }),

  create: authenticatedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        category: z.enum(["GENERAL", "HEALTH", "FAMILY", "SHALOM", "PARNASSA", "STUDY", "COMMUNITY"]).optional(),
        isAnonymous: z.boolean().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.prayerRequest.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId!,
          title: input.title,
          description: input.description,
          category: input.category ?? "GENERAL",
          isAnonymous: input.isAnonymous ?? false,
          isPublic: input.isPublic ?? true,
        },
      });
    }),

  update: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        status: z.enum(["OPEN", "ANSWERED", "CLOSED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await db.prayerRequest.findUnique({ where: { id: input.id } });
      if (!request) throw new Error("Pedido de oração não encontrado.");
      if (request.userId !== ctx.userId) throw new Error("Você só pode editar seus próprios pedidos.");

      return db.prayerRequest.update({
        where: { id: input.id },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.status !== undefined && { status: input.status }),
        },
      });
    }),

  delete: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await db.prayerRequest.findUnique({ where: { id: input.id } });
      if (!request) throw new Error("Pedido de oração não encontrado.");
      if (request.userId !== ctx.userId) throw new Error("Você só pode deletar seus próprios pedidos.");

      return db.prayerRequest.delete({ where: { id: input.id } });
    }),

  respond: authenticatedProcedure
    .input(z.object({ requestId: z.string(), message: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const request = await db.prayerRequest.findUnique({ where: { id: input.requestId } });
      if (!request) throw new Error("Pedido de oração não encontrado.");
      if (request.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.prayerResponse.create({
        data: {
          requestId: input.requestId,
          userId: ctx.userId!,
          message: input.message,
        },
      });
    }),

  listPending: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.prayerRequest.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        isAnonymous: true,
        isPublic: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
        _count: { select: { responses: true } },
      },
    });
  }),
});
