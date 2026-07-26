"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Settings, HelpCircle, Heart, Calendar, BookOpen, Search } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/client/lib/trpc";

const quickActions = [
  { label: "Meu Perfil", href: "/profile", icon: User },
  { label: "Configurações", href: "/settings", icon: Settings },
  { label: "Ajuda", href: "/help", icon: HelpCircle },
];

const placeholderActivity = [
  "Cadastrou-se na plataforma",
  "Explorou a seção de Estudos",
  "Assistiu a um evento recente",
];

export function UserDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const favoritesQuery = trpc.favorite.list.useQuery(undefined, {
    enabled: !!user,
  });
  const searchQuery = trpc.search.history.useQuery(undefined, {
    enabled: !!user,
  });

  const stats = [
    { label: "Favoritos", value: favoritesQuery.data?.favorites?.length ?? 0, icon: Heart, color: "text-red-500" },
    { label: "Eventos", value: "—", icon: Calendar, color: "text-blue-500" },
    { label: "Estudos", value: "—", icon: BookOpen, color: "text-green-500" },
    { label: "Buscas", value: searchQuery.data?.length ?? 0, icon: Search, color: "text-purple-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-semibold">
        Olá, {user?.name ?? "Usuário"}!
      </h2>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-lg bg-gray-50 p-4"
          >
            <stat.icon className={`mb-1 h-5 w-5 ${stat.color}`} />
            <span className="text-lg font-bold">{stat.value}</span>
            <span className="text-xs text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Atividade Recente
        </h3>
        <ul className="space-y-1">
          {placeholderActivity.map((item, i) => (
            <li key={i} className="text-sm text-gray-500">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
