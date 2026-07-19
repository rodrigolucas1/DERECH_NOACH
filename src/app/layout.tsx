import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/client/components/AuthProvider";
import { TRPCProvider } from "@/client/components/TRPCProvider";
import { BrandingProvider } from "@/client/components/BrandingProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Comunidade Bnei Noach",
  description:
    "Plataforma de integração da comunidade Bnei Noach do Brasil. Estudos, eventos, encontros e muito mais.",
  keywords: [
    "Bnei Noach",
    "Noé",
    "Noahide",
    "comunidade",
    "estudo",
    "Torah",
    "7 leis",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <TRPCProvider>
            <BrandingProvider>
              {children}
              <Toaster />
            </BrandingProvider>
          </TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
