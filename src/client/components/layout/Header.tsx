"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, Brain, Home, Shield, LayoutDashboard, Search, Heart, HelpCircle } from "lucide-react";
import { NotificationBell } from "@/client/components/NotificationBell";
import { useBranding } from "@/client/components/BrandingProvider";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  LEADER: "Líder",
  MEMBER: "Membro Comum",
};

const roleAreaLinks: Record<string, { href: string; label: string; icon: any }> = {
  ADMIN: { href: "/admin/dashboard", label: "Painel Admin", icon: LayoutDashboard },
  LEADER: { href: "/admin/dashboard", label: "Painel Admin", icon: LayoutDashboard },
  MEMBER: { href: "/profile", label: "Área do Membro", icon: User },
};

export function Header() {
  const { data: session, status } = useSession();
  const branding = useBranding();
  const user = session?.user;
  const role = (user as any)?.role as string | undefined;
  const areaLink = role ? roleAreaLinks[role] : undefined;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.platformName}
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-lg font-bold text-blue-900">
              {branding.platformName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/search"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Search className="h-4 w-4" />
            Pesquisar
          </Link>
          {user && (
            <Link
              href="/favorites"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </Link>
          )}
          <Link
            href="/help"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <HelpCircle className="h-4 w-4" />
            Ajuda
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Página Inicial
          </Link>
          <Link
            href="/about"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sobre
          </Link>
          <Link
            href="/communities"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Comunidades
          </Link>
          <Link
            href="/events"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Eventos
          </Link>
          <Link
            href="/studies"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Estudos
          </Link>
          <Link
            href="/ai"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Brain className="h-4 w-4" />
            Assistente IA
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : user ? (
            <>
              {areaLink && (
                <Link href={areaLink.href}>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5">
                    <areaLink.icon className="h-3.5 w-3.5" />
                    {areaLink.label}
                  </Button>
                </Link>
              )}
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger className="relative flex items-center gap-2 rounded-full outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.image ?? ""}
                      alt={user.name ?? ""}
                    />
                    <AvatarFallback>
                      {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.image ?? ""}
                        alt={user.name ?? ""}
                      />
                      <AvatarFallback>
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {role && (
                        <span className="inline-flex items-center gap-1 self-start rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          {role === "ADMIN" || role === "LEADER" ? (
                            <Shield className="h-2.5 w-2.5" />
                          ) : (
                            <User className="h-2.5 w-2.5" />
                          )}
                          {roleLabels[role] ?? role}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {areaLink && (
                    <DropdownMenuItem>
                      <Link
                        href={areaLink.href}
                        className="flex items-center gap-2"
                      >
                        <areaLink.icon className="h-4 w-4" />
                        {areaLink.label}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
