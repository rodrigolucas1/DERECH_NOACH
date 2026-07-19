import { db } from "@/server/db/client";
import { AuditAction } from "@prisma/client";
import type { Context } from "@/server/trpc/context";

export async function logAuditAction(
  ctx: Context,
  action: AuditAction,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  return db.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      action,
      entityType,
      entityId: entityId ?? null,
      newValues: details ? JSON.stringify(details) : null,
      ipAddress: ctx.headers.get("x-forwarded-for") ?? ctx.headers.get("x-real-ip") ?? null,
      userAgent: ctx.headers.get("user-agent") ?? null,
    },
  });
}
