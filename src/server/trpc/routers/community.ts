import { z } from "zod";
import { router, tenantProcedure, authenticatedProcedure, adminProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const communityInput = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  whatsappLink: z.string().url().optional(),
  meetingSchedule: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  logoUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
});

export const communityRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId) return [];

    return db.community.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        city: true,
        state: true,
        logoUrl: true,
        coverImageUrl: true,
        phone: true,
        email: true,
        whatsappLink: true,
        meetingSchedule: true,
        _count: { select: { members: true, events: true, studies: true } },
      },
      orderBy: { name: "asc" },
    });
  }),

  listAll: tenantProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50), cursor: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return { items: [], nextCursor: null as string | null };

      const take = input?.limit ?? 50;
      const cursor = input?.cursor;

      const items = await db.community.findMany({
        where: { tenantId: ctx.tenantId },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          isActive: true,
          logoUrl: true,
          _count: { select: { members: true, events: true } },
        },
        orderBy: { name: "asc" },
      });

      let nextCursor: string | null = null;
      if (items.length > take) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id ?? null;
      }

      return { items, nextCursor };
    }),

  getBySlug: tenantProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.community.findUnique({
        where: {
          tenantId_slug: { tenantId: ctx.tenantId, slug: input.slug },
        },
        include: {
          _count: { select: { members: true, events: true, studies: true } },
        },
      });
    }),

  getById: tenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.tenantId) return null;

      return db.community.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { members: true, events: true, studies: true } },
        },
      });
    }),

  create: adminProcedure(["ADMIN"])
    .input(communityInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) throw new Error("Tenant não encontrado.");

      const existing = await db.community.findFirst({
        where: { tenantId: ctx.tenantId, slug: input.slug },
      });
      if (existing) throw new Error("Já existe uma comunidade com esse slug.");

      return db.community.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  update: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }).merge(communityInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const community = await db.community.findUnique({ where: { id } });
      if (!community) throw new Error("Comunidade não encontrada.");
      if (community.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      if (data.slug) {
        const existing = await db.community.findFirst({
          where: {
            tenantId: ctx.tenantId,
            slug: data.slug,
            id: { not: id },
          },
        });
        if (existing) throw new Error("Já existe uma comunidade com esse slug.");
      }

      return db.community.update({ where: { id }, data });
    }),

  toggleActive: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const community = await db.community.findUnique({ where: { id: input.id } });
      if (!community) throw new Error("Comunidade não encontrada.");
      if (community.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.community.update({
        where: { id: input.id },
        data: { isActive: !community.isActive },
      });
    }),

  delete: adminProcedure(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const community = await db.community.findUnique({ where: { id: input.id } });
      if (!community) throw new Error("Comunidade não encontrada.");
      if (community.tenantId !== ctx.tenantId) throw new Error("Acesso negado.");

      return db.community.delete({ where: { id: input.id } });
    }),
});
