"use client";

import { useBranding } from "@/client/components/BrandingProvider";

export function Footer() {
  const branding = useBranding();

  return (
    <footer className="border-t bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {branding.platformName}. Todos os direitos reservados.
          </p>
          {branding.footerText && (
            <p className="text-xs text-gray-400">{branding.footerText}</p>
          )}
          <div className="flex gap-4">
            <a href="/about" className="text-sm text-gray-500 hover:text-gray-700">
              Sobre
            </a>
            <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
              Contato
            </a>
            <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
