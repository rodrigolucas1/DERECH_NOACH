import { z } from "zod";
import { router, authenticatedProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const authRouter = router({
  me: authenticatedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.userId! },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        createdAt: true,
        lastLoginAt: true,
        tenantMembers: {
          select: {
            role: true,
            tenant: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return user;
  }),

  updateProfile: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
        bio: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.update({
        where: { id: ctx.userId! },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bio: true,
        },
      });

      return user;
    }),
});
