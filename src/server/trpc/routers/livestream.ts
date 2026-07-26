import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const streamPlatformEnum = z.enum(["YOUTUBE", "VIMEO", "ZOOM", "GOOGLE_MEET", "MS_TEAMS", "OTHER"]);
const streamStatusEnum = z.enum(["SCHEDULED", "LIVE", "ENDED"]);

export const livestreamRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.liveStream.findMany({
      where: {
        tenantId: ctx.tenantId,
        status: { not: "ENDED" },
      },
      orderBy: { scheduledAt: "desc" },
      include: {
        event: { select: { id: true, title: true } },
      },
    });
  }),

  listAll: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.liveStream.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        event: { select: { id: true, title: true } },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.liveStream.findUnique({
        where: { id: input.id },
        include: {
          event: { select: { id: true, title: true, dateTime: true, description: true } },
        },
      });
    }),

  getByEventId: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      return db.liveStream.findFirst({
        where: { eventId: input.eventId },
        include: {
          event: { select: { id: true, title: true } },
        },
      });
    }),

  active: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return null;

    return db.liveStream.findFirst({
      where: {
        tenantId: ctx.tenantId,
        status: "LIVE",
      },
      include: {
        event: { select: { id: true, title: true } },
      },
    });
  }),

  create: adminProcedure(["ADMIN"])
    .input(
      z.object({
        eventId: z.string().optional(),
        platform: streamPlatformEnum,
        streamUrl: z.string().url(),
        chatUrl: z.string().url().optional(),
        embedCode: z.string().optional(),
        chatEnabled: z.boolean().optional(),
        scheduledAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.liveStream.create({
        data: {
          tenantId: ctx.tenantId,
          eventId: input.eventId ?? null,
          platform: input.platform,
          streamUrl: input.streamUrl,
          chatUrl: input.chatUrl ?? null,
          embedCode: input.embedCode ?? null,
          chatEnabled: input.chatEnabled ?? true,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(
      z.object({
        id: z.string(),
        eventId: z.string().nullable().optional(),
        platform: streamPlatformEnum.optional(),
        streamUrl: z.string().url().optional(),
        chatUrl: z.string().url().nullable().optional(),
        embedCode: z.string().nullable().optional(),
        chatEnabled: z.boolean().optional(),
        status: streamStatusEnum.optional(),
        scheduledAt: z.string().datetime().nullable().optional(),
        startedAt: z.string().datetime().nullable().optional(),
        endedAt: z.string().datetime().nullable().optional(),
        viewerCount: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, scheduledAt, startedAt, endedAt, ...data } = input;

      const stream = await db.liveStream.findUnique({ where: { id } });
      if (!stream) throw new Error("Live stream não encontrada.");
      if (stream.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.liveStream.update({
        where: { id },
        data: {
          ...data,
          ...(scheduledAt !== undefined ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null } : {}),
          ...(startedAt !== undefined ? { startedAt: startedAt ? new Date(startedAt) : null } : {}),
          ...(endedAt !== undefined ? { endedAt: endedAt ? new Date(endedAt) : null } : {}),
        },
      });
    }),

  goLive: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stream = await db.liveStream.findUnique({ where: { id: input.id } });
      if (!stream) throw new Error("Live stream não encontrada.");
      if (stream.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.liveStream.update({
        where: { id: input.id },
        data: { status: "LIVE", startedAt: new Date() },
      });
    }),

  endLive: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stream = await db.liveStream.findUnique({ where: { id: input.id } });
      if (!stream) throw new Error("Live stream não encontrada.");
      if (stream.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.liveStream.update({
        where: { id: input.id },
        data: { status: "ENDED", endedAt: new Date() },
      });
    }),

  updateViewerCount: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string(), count: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const stream = await db.liveStream.findUnique({ where: { id: input.id } });
      if (!stream) throw new Error("Live stream não encontrada.");
      if (stream.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.liveStream.update({
        where: { id: input.id },
        data: { viewerCount: input.count },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stream = await db.liveStream.findUnique({ where: { id: input.id } });
      if (!stream) throw new Error("Live stream não encontrada.");
      if (stream.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.liveStream.delete({ where: { id: input.id } });
    }),
});
