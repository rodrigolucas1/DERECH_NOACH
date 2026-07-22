"use client";

import {
  Users,
  MapPin,
  Calendar,
  BookOpen,
  Newspaper,
  HandHeart,
  Activity,
} from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { PageHeader } from "@/client/components/ui/PageHeader";
import { LoadingSkeleton } from "@/client/components/ui/LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const statCards = [
  {
    key: "totalUsers" as const,
    subKey: "activeUsers" as const,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Usuarios",
    subLabel: "Ativos",
  },
  {
    key: "totalCommunities" as const,
    subKey: null,
    icon: MapPin,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Comunidades",
    subLabel: null,
  },
  {
    key: "totalEvents" as const,
    subKey: "upcomingEvents" as const,
    icon: Calendar,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "Eventos",
    subLabel: "Proximos",
  },
  {
    key: "totalStudyMaterials" as const,
    subKey: null,
    icon: BookOpen,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "Materiais",
    subLabel: null,
  },
  {
    key: "totalNewsArticles" as const,
    subKey: "publishedArticles" as const,
    icon: Newspaper,
    color: "text-rose-600",
    bg: "bg-rose-50",
    label: "Noticias",
    subLabel: "Publicadas",
  },
  {
    key: "totalTzedakaCampaigns" as const,
    subKey: "activeCampaigns" as const,
    icon: HandHeart,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Tzedaka",
    subLabel: "Campanhas ativas",
  },
];

function formatAction(action: string): string {
  const map: Record<string, string> = {
    CREATE: "Criacao",
    UPDATE: "Atualizacao",
    DELETE: "Exclusao",
    LOGIN: "Login",
    LOGOUT: "Logout",
    VIEW: "Visualizacao",
    EXPORT: "Exportacao",
  };
  return map[action] ?? action;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.analytics.platformStats.useQuery();
  const { data: growth, isLoading: growthLoading } =
    trpc.analytics.userGrowth.useQuery();
  const { data: activity, isLoading: activityLoading } =
    trpc.analytics.recentActivity.useQuery();
  const { data: events, isLoading: eventsLoading } =
    trpc.event.listAll.useQuery();

  const upcomingEvents = events?.filter(
    (e) => e.isActive && new Date(e.dateTime) >= new Date()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visao geral da plataforma"
      />

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
                {card.subKey && card.subLabel && (
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
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Crescimento de Usuarios
          </h2>
          {growthLoading ? (
            <LoadingSkeleton variant="card" rows={4} />
          ) : !growth?.length ? (
            <p className="text-sm text-gray-500">
              Sem dados de crescimento.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" fill="#1a56db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Atividade Recente
            </h2>
          </div>
          {activityLoading ? (
            <LoadingSkeleton variant="list" rows={5} />
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
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Proximos Eventos
        </h2>
        {eventsLoading ? (
          <LoadingSkeleton variant="list" rows={3} />
        ) : !upcomingEvents?.length ? (
          <p className="text-sm text-gray-500">
            Nenhum evento agendado.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {event.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {event.community?.name ?? "Sem comunidade"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{event._count.registrations} inscritos</span>
                  <span>
                    {new Date(event.dateTime).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
