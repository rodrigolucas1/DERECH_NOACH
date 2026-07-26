import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure, publicProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const speakerRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    return db.speaker.findMany({
      where: { tenantId: ctx.tenantId, isPublic: true },
      include: { expertise: true, events: { include: { event: { select: { id: true, title: true, dateTime: true } } } } },
      orderBy: { name: "asc" },
    });
  }),

  listAll: adminProcedure(["ADMIN"]).query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];
    return db.speaker.findMany({
      where: { tenantId: ctx.tenantId },
      include: { expertise: true, events: true },
      orderBy: { name: "asc" },
    });
  }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return db.speaker.findUnique({
      where: { id: input.id },
      include: { expertise: true, events: { include: { event: true } } },
    });
  }),

  create: adminProcedure(["ADMIN"]).input(z.object({
    userId: z.string().optional(), name: z.string(), title: z.string().optional(),
    bio: z.string().optional(), photoUrl: z.string().optional(),
    email: z.string().optional(), phone: z.string().optional(), website: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    if (!ctx.tenantId) throw new Error("Tenant não encontrado.");
    return db.speaker.create({ data: { ...input, tenantId: ctx.tenantId } });
  }),

  update: adminProcedure(["ADMIN"]).input(z.object({
    id: z.string(), name: z.string().optional(), title: z.string().optional(),
    bio: z.string().optional(), photoUrl: z.string().optional(), email: z.string().optional(),
    phone: z.string().optional(), website: z.string().optional(), isPublic: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const speaker = await db.speaker.findUnique({ where: { id } });
    if (!speaker || speaker.tenantId !== ctx.tenantId) throw new Error("Palestrante não encontrado.");
    return db.speaker.update({ where: { id }, data });
  }),

  delete: adminProcedure(["ADMIN"]).input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const speaker = await db.speaker.findUnique({ where: { id: input.id } });
    if (!speaker || speaker.tenantId !== ctx.tenantId) throw new Error("Palestrante não encontrado.");
    return db.speaker.delete({ where: { id: input.id } });
  }),

  addExpertise: adminProcedure(["ADMIN"]).input(z.object({ speakerId: z.string(), topic: z.string() })).mutation(async ({ ctx, input }) => {
    const speaker = await db.speaker.findUnique({ where: { id: input.speakerId } });
    if (!speaker || speaker.tenantId !== ctx.tenantId) throw new Error("Palestrante não encontrado.");
    return db.speakerExpertise.create({ data: { speakerId: input.speakerId, topic: input.topic } });
  }),

  removeExpertise: adminProcedure(["ADMIN"]).input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return db.speakerExpertise.delete({ where: { id: input.id } });
  }),

  linkEvent: adminProcedure(["ADMIN"]).input(z.object({ speakerId: z.string(), eventId: z.string() })).mutation(async ({ input }) => {
    return db.speakerEvent.create({ data: { speakerId: input.speakerId, eventId: input.eventId } });
  }),

  unlinkEvent: adminProcedure(["ADMIN"]).input(z.object({ speakerId: z.string(), eventId: z.string() })).mutation(async ({ input }) => {
    return db.speakerEvent.delete({ where: { speakerId_eventId: { speakerId: input.speakerId, eventId: input.eventId } } });
  }),
});
