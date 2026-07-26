import { z } from "zod";
import { router, authenticatedProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

const defaultPreferences = {
  theme: "system",
  language: "pt-BR",
  notifyEmail: true,
  notifyInApp: true,
  notifyEvents: true,
  notifyStudies: true,
  notifyNews: true,
  fontSize: "normal",
  reducedMotion: false,
  highContrast: false,
};

export const userPreferenceRouter = router({
  get: authenticatedProcedure.query(async ({ ctx }) => {
    const existing = await db.userPreference.findUnique({
      where: { userId: ctx.userId! },
    });

    if (existing) return existing;

    return db.userPreference.create({
      data: {
        userId: ctx.userId!,
        ...defaultPreferences,
      },
    });
  }),

  update: authenticatedProcedure
    .input(
      z.object({
        theme: z.enum(["light", "dark", "system"]).optional(),
        language: z.string().optional(),
        notifyEmail: z.boolean().optional(),
        notifyInApp: z.boolean().optional(),
        notifyEvents: z.boolean().optional(),
        notifyStudies: z.boolean().optional(),
        notifyNews: z.boolean().optional(),
        fontSize: z.enum(["small", "normal", "large"]).optional(),
        reducedMotion: z.boolean().optional(),
        highContrast: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.userPreference.upsert({
        where: { userId: ctx.userId! },
        create: {
          userId: ctx.userId!,
          ...defaultPreferences,
          ...input,
        },
        update: input,
      });
    }),

  reset: authenticatedProcedure.mutation(async ({ ctx }) => {
    return db.userPreference.upsert({
      where: { userId: ctx.userId! },
      create: {
        userId: ctx.userId!,
        ...defaultPreferences,
      },
      update: defaultPreferences,
    });
  }),
});
