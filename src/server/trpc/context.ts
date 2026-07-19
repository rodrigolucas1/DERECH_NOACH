import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "@/server/db/client";
import { resolveTenant } from "@/server/utils/tenant-resolver";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export type Context = {
  tenantId: string | null;
  tenantSlug: string | null;
  userId: string | null;
  userRole: string | null;
  headers: Headers;
};

export async function createContext({
  headers,
}: {
  headers: Headers;
}): Promise<Context> {
  const host = headers.get("host") ?? "localhost:3000";
  const tenant = await resolveTenant(host);

  const headerTenantSlug = headers.get("x-tenant-id");
  let finalTenantId = tenant.tenantId;
  let finalTenantSlug = tenant.tenantSlug;

  if (headerTenantSlug && process.env.NODE_ENV === "development") {
    const tenantRecord = await db.tenant.findUnique({
      where: { slug: headerTenantSlug },
      select: { id: true, slug: true, isActive: true },
    });
    if (tenantRecord && tenantRecord.isActive) {
      finalTenantId = tenantRecord.id;
      finalTenantSlug = tenantRecord.slug;
    }
  }

  let userId: string | null = null;
  let userRole: string | null = null;

  try {
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
      if (finalTenantId) {
        const member = await db.tenantMember.findUnique({
          where: {
            tenantId_userId: {
              tenantId: finalTenantId,
              userId: session.user.id,
            },
          },
          select: { role: true },
        });
        userRole = member?.role ?? null;
      }
    }
  } catch {
    // Session not available in this context
  }

  return {
    tenantId: finalTenantId,
    tenantSlug: finalTenantSlug,
    userId,
    userRole,
    headers,
  };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof z.ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware: Require authentication
 */
const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar logado para acessar este recurso.",
    });
  }

  return next({ ctx });
});

/**
 * Middleware: Require specific tenant role
 */
function requireRole(...roles: string[]) {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Você precisa estar logado.",
      });
    }

    if (!ctx.userRole || !roles.includes(ctx.userRole)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Você não tem permissão para esta ação.",
      });
    }

    return next({ ctx });
  });
}

export const tenantProcedure = publicProcedure;
export const authenticatedProcedure = publicProcedure.use(authMiddleware);
export const adminProcedure = (roles: string[]) =>
  publicProcedure.use(authMiddleware).use(requireRole(...roles));
