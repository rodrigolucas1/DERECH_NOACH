import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const eventInput = z.object({
  communityId: z.string().optional().nullable(),
  title: z.string().min(2),
  description: z.string().optional(),
  dateTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().nullable(),
  eventType: z.enum(["IN_PERSON", "ONLINE", "HYBRID"]).default("IN_PERSON"),
  isLiveStream: z.boolean().default(false),
  maxAttendees: z.number().int().positive().optional().nullable(),
});

export const eventRouter = router({
  list: tenantProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().nullish(),
        upcoming: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return { items: [], nextCursor: null };

      const limit = input?.limit ?? 20;
      const where: any = { tenantId: ctx.tenantId, isActive: true };
      if (input?.upcoming) where.dateTime = { gte: new Date() };

      const items = await db.event.findMany({
        where,
        take: limit + 1,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { dateTime: input?.upcoming ? "asc" : "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          dateTime: true,
          endTime: true,
          location: true,
          eventType: true,
          isLiveStream: true,
          maxAttendees: true,
          community: { select: { name: true, slug: true } },
          _count: { select: { registrations: true } },
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

    return db.event.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { dateTime: "desc" },
      select: {
        id: true,
        title: true,
        dateTime: true,
        eventType: true,
        isActive: true,
        community: { select: { name: true } },
        _count: { select: { registrations: true } },
      },
    });
  }),

  getById: tenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return db.event.findUnique({
        where: { id: input.id },
        include: {
          community: { select: { name: true, slug: true, city: true } },
          registrations: {
            select: { userId: true, registeredAt: true, attended: true },
          },
          _count: { select: { registrations: true } },
        },
      });
    }),

  create: adminProcedure(["ADMIN"])
    .input(eventInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      return db.event.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
          createdById: ctx.userId!,
          dateTime: new Date(input.dateTime),
          endTime: input.endTime ? new Date(input.endTime) : null,
        },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(eventInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, dateTime, endTime, ...data } = input;

      const event = await db.event.findUnique({ where: { id } });
      if (!event) throw new Error("Evento não encontrado.");
      if (event.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.event.update({
        where: { id },
        data: {
          ...data,
          ...(dateTime ? { dateTime: new Date(dateTime) } : {}),
          ...(endTime !== undefined ? { endTime: endTime ? new Date(endTime) : null } : {}),
        },
      });
    }),

  toggleActive: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await db.event.findUnique({ where: { id: input.id } });
      if (!event) throw new Error("Evento não encontrado.");
      if (event.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.event.update({
        where: { id: input.id },
        data: { isActive: !event.isActive },
      });
    }),

  register: authenticatedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await db.event.findUnique({
        where: { id: input.eventId },
        include: { _count: { select: { registrations: true } } },
      });
      if (!event) throw new Error("Evento não encontrado.");
      if (!event.isActive) throw new Error("Evento não está ativo.");

      if (event.maxAttendees && event._count.registrations >= event.maxAttendees) {
        throw new Error("Evento lotado.");
      }

      const existing = await db.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: input.eventId, userId: ctx.userId! } },
      });
      if (existing) throw new Error("Você já está inscrito neste evento.");

      return db.eventRegistration.create({
        data: { eventId: input.eventId, userId: ctx.userId! },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await db.event.findUnique({ where: { id: input.id } });
      if (!event) throw new Error("Evento não encontrado.");
      if (event.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.event.delete({ where: { id: input.id } });
    }),
});
