import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { resolveTenant } from "@/server/utils/tenant-resolver";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") ?? "localhost:3000";
    const { tenantId } = await resolveTenant(host);

    if (!tenantId) {
      return NextResponse.json({
        platformName: "Portal Bnei Noach",
        primaryColor: "#1a56db",
        secondaryColor: "#1e40af",
        backgroundColor: "#ffffff",
        textColor: "#111827",
        accentColor: "#f59e0b",
      });
    }

    const branding = await db.brandingConfig.findUnique({
      where: { tenantId },
      select: {
        platformName: true,
        logoUrl: true,
        faviconUrl: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        textColor: true,
        accentColor: true,
        slogan: true,
        footerText: true,
        metaTitle: true,
        metaDescription: true,
        ogImageUrl: true,
      },
    });

    return NextResponse.json(
      branding ?? {
        platformName: "Portal Bnei Noach",
        primaryColor: "#1a56db",
        secondaryColor: "#1e40af",
        backgroundColor: "#ffffff",
        textColor: "#111827",
        accentColor: "#f59e0b",
      }
    );
  } catch {
    return NextResponse.json({
      platformName: "Portal Bnei Noach",
      primaryColor: "#1a56db",
      secondaryColor: "#1e40af",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      accentColor: "#f59e0b",
    });
  }
}
