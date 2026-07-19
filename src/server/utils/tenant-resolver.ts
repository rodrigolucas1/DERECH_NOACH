import { db } from "@/server/db/client";

export interface TenantContext {
  tenantId: string | null;
  tenantSlug: string | null;
}

/**
 * Resolve tenant by subdomain or slug.
 *
 * Strategy: extracts the first subdomain segment from the host.
 * Example: "mg.bneinoach.org" → slug "mg"
 * Falls back to null (national/no tenant).
 */
export function resolveTenantFromHost(host: string): string | null {
  const hostname = host.split(":")[0]; // strip port

  // Local development: check for x-tenant-id header or query param
  // handled in middleware layer

  const parts = hostname.split(".");

  // e.g. "mg.bneinoach.org" → "mg"
  // e.g. "portal-bneinoach.vercel.app" → "portal-bneinoach" (skip)
  if (parts.length >= 3) {
    return parts[0];
  }

  // e.g. "localhost" → null
  return null;
}

/**
 * Fetch tenant by slug from database.
 */
export async function getTenantBySlug(slug: string) {
  return db.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      state: true,
      isActive: true,
    },
  });
}

/**
 * Full tenant resolution: host → slug → tenant record.
 */
export async function resolveTenant(host: string): Promise<TenantContext> {
  const slug = resolveTenantFromHost(host);

  if (!slug) {
    return { tenantId: null, tenantSlug: null };
  }

  const tenant = await getTenantBySlug(slug);

  if (!tenant || !tenant.isActive) {
    return { tenantId: null, tenantSlug: null };
  }

  return {
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
  };
}
