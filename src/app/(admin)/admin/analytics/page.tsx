"use client";

import {
  Users,
  MapPin,
  Calendar,
  BookOpen,
  Newspaper,
  HandHeart,
  Award,
  Shield,
  Library,
  BarChart3,
  Activity,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/client/lib/trpc";

const statCards = [
  {
    key: "totalUsers" as const,
    subKey: "activeUsers" as const,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Usuários",
    subLabel: "Ativos (30 dias)",
  },
  {
    key: "totalCommunities" as const,
    subKey: "activeCommunities" as const,
    icon: MapPin,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Comunidades",
    subLabel: "Ativas",
  },
  {
    key: "totalEvents" as const,
    subKey: "upcomingEvents" as const,
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "Eventos",
    subLabel: "Próximos",
  },
  {
    key: "totalStudyMaterials" as const,
    subKey: null,
    icon: BookOpen,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "Estudos",
    subLabel: "Materiais",
  },
  {
    key: "totalLibraryItems" as const,
    subKey: "totalLibraryDownloads" as const,
    icon: Library,
    color: "text-teal-600",
    bg: "bg-teal-50",
    label: "Biblioteca",
    subLabel: "Downloads",
  },
  {
    key: "totalNewsArticles" as const,
    subKey: "publishedArticles" as const,
    icon: Newspaper,
    color: "text-rose-600",
    bg: "bg-rose-50",
    label: "Notícias",
    subLabel: "Publicadas",
  },
  {
    key: "totalTzedakaCampaigns" as const,
    subKey: "activeCampaigns" as const,
    icon: HandHeart,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Tzedaká",
    subLabel: "Campanhas ativas",
  },
  {
    key: "totalCertificates" as const,
    subKey: null,
    icon: Award,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    label: "Certificados",
    subLabel: "Total",
  },
  {
    key: "totalAuditLogs" as const,
    subKey: null,
    icon: Shield,
    color: "text-gray-600",
    bg: "bg-gray-50",
    label: "Auditoria",
    subLabel: "Logs (30 dias)",
  },
];

function formatAction(action: string): string {
  const map: Record<string, string> = {
    CREATE: "Criação",
    UPDATE: "Atualização",
    DELETE: "Exclusão",
    LOGIN: "Login",
    LOGOUT: "Logout",
    VIEW: "Visualização",
    EXPORT: "Exportação",
  };
  return map[action] ?? action;
}

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.analytics.platformStats.useQuery();
  const { data: activity, isLoading: activityLoading } =
    trpc.analytics.recentActivity.useQuery();
  const { data: growth, isLoading: growthLoading } =
    trpc.analytics.userGrowth.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            Métricas e visão geral da plataforma
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? (
                    <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-200" />
                  ) : (
                    stats?.[card.key] ?? 0
                  )}
                </p>
                {card.subKey && (
                  <p className="text-xs text-gray-400">
                    {statsLoading ? (
                      <span className="inline-block h-3 w-8 animate-pulse rounded bg-gray-100" />
                    ) : (
                      <>
                        {card.subLabel}: {stats?.[card.subKey] ?? 0}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Atividade Recente
            </h2>
          </div>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          ) : !activity?.length ? (
            <p className="text-sm text-gray-500">
              Nenhuma atividade registrada.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md border px-4 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formatAction(log.action)} — {log.entityType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {log.user?.name ?? log.user?.email ?? "Sistema"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Crescimento de Usuários
            </h2>
          </div>
          {growthLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          ) : !growth?.length ? (
            <p className="text-sm text-gray-500">
              Sem dados de crescimento.
            </p>
          ) : (
            <div className="space-y-2">
              {growth.map((item) => {
                const maxCount = Math.max(...growth.map((g) => g.count), 1);
                const pct = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-gray-500">
                      {item.month}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-4 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-semibold text-gray-700">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
