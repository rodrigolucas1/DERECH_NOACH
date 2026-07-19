"use client";

import { Users, MapPin, Calendar, BookOpen } from "lucide-react";
import { trpc } from "@/client/lib/trpc";

const statIcons = [
  { key: "users" as const, icon: Users, color: "text-blue-600", bg: "bg-blue-50", label: "Total Usuários" },
  { key: "communities" as const, icon: MapPin, color: "text-green-600", bg: "bg-green-50", label: "Comunidades" },
  { key: "events" as const, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", label: "Eventos" },
  { key: "studies" as const, icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50", label: "Materiais de Estudo" },
];

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral da plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statIcons.map((stat) => (
          <div
            key={stat.key}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200" />
                  ) : (
                    stats?.[stat.key] ?? 0
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Atividade Recente</h2>
          <p className="mt-2 text-sm text-gray-500">
            Nenhuma atividade registrada ainda.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Próximos Eventos</h2>
          <p className="mt-2 text-sm text-gray-500">
            Nenhum evento agendado.
          </p>
        </div>
      </div>
    </div>
  );
}
