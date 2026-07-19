import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para resolver tenant por subdomínio.
 *
 * Em desenvolvimento, aceita o header x-tenant-id para testes.
 * Exemplo: "mg" no header x-tenant-id direciona para o tenant MG.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "localhost:3000";

  // Skip middleware for static files and API routes (except trpc)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/trpc"))
  ) {
    return NextResponse.next();
  }

  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // In development, check x-tenant-id header
  const isDev = process.env.NODE_ENV === "development";
  const devTenant = isDev ? request.headers.get("x-tenant-id") : null;

  // Subdomain extraction (e.g. "mg.bneinoach.org" → "mg")
  const subdomainTenant =
    parts.length >= 3 && !["www", "app", "api"].includes(parts[0])
      ? parts[0]
      : null;

  const tenantSlug = devTenant ?? subdomainTenant;

  // Rewrite to include tenant in the URL path for internal routing
  if (tenantSlug) {
    // Don't rewrite if already has tenant prefix
    if (!pathname.startsWith(`/${tenantSlug}`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${tenantSlug}${pathname}`;
      return NextResponse.rewrite(url, {
        request: {
          headers: new Headers({
            ...Object.fromEntries(request.headers.entries()),
            "x-tenant-id": tenantSlug,
          }),
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
