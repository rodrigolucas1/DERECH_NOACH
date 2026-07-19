import { z } from "zod";
import { router, publicProcedure, tenantProcedure } from "@/server/trpc/context";
import { db } from "@/server/db/client";

export const tenantRouter = router({
  getCurrent: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantSlug) {
      return null;
    }

    const tenant = await db.tenant.findUnique({
      where: { slug: ctx.tenantSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        state: true,
        branding: {
          select: {
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    return tenant;
  }),

  list: publicProcedure.query(async () => {
    return db.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        state: true,
        branding: {
          select: {
            logoUrl: true,
          },
        },
        _count: {
          select: {
            communities: true,
            members: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }),
});
