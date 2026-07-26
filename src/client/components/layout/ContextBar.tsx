"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, ChevronRight, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  LEADER: "Líder",
  MEMBER: "Membro Comum",
};

const roleAreas: Record<string, { href: string; label: string }> = {
  ADMIN: { href: "/admin/dashboard", label: "Painel Administrativo" },
  LEADER: { href: "/admin/dashboard", label: "Painel Administrativo" },
  MEMBER: { href: "/profile", label: "Área do Membro" },
};

const routeLabels: Record<string, string> = {
  "/": "Página Inicial",
  "/about": "Sobre",
  "/communities": "Comunidades",
  "/events": "Eventos",
  "/studies": "Estudos",
  "/library": "Biblioteca",
  "/forum": "Fórum",
  "/tzedaka": "Tzedaká",
  "/ai": "Assistente IA",
  "/contact": "Contato",
  "/news": "Notícias",
  "/rabbi": "Pergunte ao Rabino",
  "/login": "Entrar",
  "/register": "Cadastre-se",
  "/profile": "Meu Perfil",
  "/settings": "Configurações",
};

export function ContextBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const role = (user as any)?.role as string | undefined;

  if (status !== "authenticated" || !user || !role) return null;

  const area = roleAreas[role];
  const label = roleLabels[role] ?? role;
  const pageLabel =
    routeLabels[pathname] ??
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "Página";

  return (
    <div className="border-b bg-blue-50/80 backdrop-blur">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Home className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-medium text-gray-800">{pageLabel}</span>
          <span className="mx-1.5 text-gray-300">|</span>
          <span className="flex items-center gap-1">
            {role === "ADMIN" || role === "LEADER" ? (
              <Shield className="h-3 w-3 text-blue-600" />
            ) : (
              <User className="h-3 w-3 text-blue-600" />
            )}
            <span className="text-gray-500">
              Conectado como{" "}
              <span className="font-medium text-blue-700">{label}</span>
            </span>
          </span>
        </div>

        {area && pathname !== area.href && (
          <Link href={area.href}>
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1 border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-50"
            >
              <LayoutDashboard className="h-3 w-3" />
              {area.label}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
