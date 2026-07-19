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

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Usuários", href: "/admin/users", icon: Users },
  { name: "Comunidades", href: "/admin/communities", icon: MapPin },
  { name: "Eventos", href: "/admin/events", icon: Calendar },
  { name: "Estudos", href: "/admin/studies", icon: BookOpen },
  { name: "Biblioteca", href: "/admin/library", icon: Library },
  { name: "Notícias", href: "/admin/news", icon: Newspaper },
  { name: "Banners", href: "/admin/banners", icon: Megaphone },
  { name: "Tzedaká", href: "/admin/tzedaka", icon: HandHeart },
  { name: "Pergunte ao Rabino", href: "/admin/rabbi", icon: MessageCircleQuestion },
  { name: "Páginas (CMS)", href: "/admin/pages", icon: FileText },
  { name: "Assistente IA", href: "/ai", icon: Brain },
  { name: "Integrações", href: "/admin/integrations", icon: Plug },
  { name: "Auditoria", href: "/admin/audit", icon: Shield },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Certificados", href: "/admin/certificates", icon: Award },
  { name: "Notificações", href: "/admin/notifications", icon: Bell },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
        {navigation.map((item) => {
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
