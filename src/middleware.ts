import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para resolver tenant por subdomínio e proteger rotas admin.
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
    return addSecurityHeaders(NextResponse.next());
  }

  // Defense-in-depth check for admin routes: verify a session cookie is present.
  // This is NOT a substitute for real authentication — actual auth happens in
  // tRPC context and the admin layout. This only prevents unauthenticated
  // browsers from reaching the admin pages at all.
  if (pathname.startsWith("/admin")) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value ??
      request.cookies.get("next-auth.session-token")?.value ??
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }
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

  const tenantSlug = devTenant ?? subdomainTenant ?? (isDev ? "mg" : null);

  // Rewrite to include tenant in the URL path for internal routing
  if (tenantSlug) {
    // Don't rewrite if already has tenant prefix
    if (!pathname.startsWith(`/${tenantSlug}`)) {
      const response = NextResponse.next({
        request: {
          headers: new Headers({
            ...Object.fromEntries(request.headers.entries()),
            "x-tenant-id": tenantSlug,
          }),
        },
      });
      return addSecurityHeaders(response);
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  return response;
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
