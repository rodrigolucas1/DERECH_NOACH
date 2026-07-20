"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  BookOpen,
  Newspaper,
  Settings,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  HandHeart,
  MessageCircleQuestion,
  Library,
  FileText,
  Shield,
  Bell,
  BarChart3,
  Award,
  Brain,
  Plug,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "LEADER"] },
  { name: "Usuários", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
  { name: "Comunidades", href: "/admin/communities", icon: MapPin, roles: ["ADMIN", "LEADER"] },
  { name: "Eventos", href: "/admin/events", icon: Calendar, roles: ["ADMIN", "LEADER"] },
  { name: "Estudos", href: "/admin/studies", icon: BookOpen, roles: ["ADMIN", "LEADER"] },
  { name: "Biblioteca", href: "/admin/library", icon: Library, roles: ["ADMIN", "LEADER"] },
  { name: "Notícias", href: "/admin/news", icon: Newspaper, roles: ["ADMIN"] },
  { name: "Banners", href: "/admin/banners", icon: Megaphone, roles: ["ADMIN"] },
  { name: "Tzedaká", href: "/admin/tzedaka", icon: HandHeart, roles: ["ADMIN", "LEADER"] },
  { name: "Pergunte ao Rabino", href: "/admin/rabbi", icon: MessageCircleQuestion, roles: ["ADMIN"] },
  { name: "Páginas (CMS)", href: "/admin/pages", icon: FileText, roles: ["ADMIN"] },
  { name: "Assistente IA", href: "/ai", icon: Brain, roles: ["ADMIN", "LEADER"] },
  { name: "Integrações", href: "/admin/integrations", icon: Plug, roles: ["ADMIN"] },
  { name: "Auditoria", href: "/admin/audit", icon: Shield, roles: ["ADMIN"] },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["ADMIN"] },
  { name: "Certificados", href: "/admin/certificates", icon: Award, roles: ["ADMIN"] },
  { name: "Notificações", href: "/admin/notifications", icon: Bell, roles: ["ADMIN", "LEADER"] },
  { name: "Configurações", href: "/admin/settings", icon: Settings, roles: ["ADMIN"] },
];

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navigation.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {collapsed ? "←" : "← Voltar ao site"}
        </Link>
      </div>
    </aside>
  );
}
