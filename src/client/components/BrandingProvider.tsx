"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface BrandingConfig {
  platformName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  slogan: string | null;
  footerText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
}

const defaultBranding: BrandingConfig = {
  platformName: "Portal Bnei Noach",
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#1a56db",
  secondaryColor: "#1e40af",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  accentColor: "#f59e0b",
  slogan: null,
  footerText: null,
  metaTitle: null,
  metaDescription: null,
  ogImageUrl: null,
};

const BrandingContext = createContext<BrandingConfig>(defaultBranding);

export function useBranding() {
  return useContext(BrandingContext);
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);

  useEffect(() => {
    async function fetchBranding() {
      try {
        const res = await fetch("/api/branding");
        if (res.ok) {
          const data = await res.json();
          setBranding({ ...defaultBranding, ...data });
        }
      } catch {
        // Use defaults
      }
    }

    fetchBranding();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", branding.primaryColor);
    root.style.setProperty("--color-secondary", branding.secondaryColor);
    root.style.setProperty("--color-accent", branding.accentColor);
    root.style.setProperty("--color-background", branding.backgroundColor);
    root.style.setProperty("--color-text", branding.textColor);

    if (branding.faviconUrl) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) link.href = branding.faviconUrl;
    }

    if (branding.metaTitle) {
      document.title = branding.metaTitle;
    }
  }, [branding]);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}
