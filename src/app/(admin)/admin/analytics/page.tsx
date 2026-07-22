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
  Download,
} from "lucide-react";
import { trpc } from "@/client/lib/trpc";
import { LoadingSkeleton } from "@/client/components/ui/LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#1a56db",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#eab308",
  "#dc2626",
  "#0891b2",
  "#ec4899",
  "#6366f1",
];

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  DOCUMENT: "Documento",
  VIDEO: "Video",
  AUDIO: "Audio",
  LINK: "Link",
};

const MODULE_LABELS: Record<string, string> = {
  news: "Noticias",
  studies: "Estudos",
  library: "Biblioteca",
  events: "Eventos",
  communities: "Comunidades",
  forumTopics: "Forum",
  rabbiQuestions: "Rabino",
};

const statCards = [
  {
    key: "totalUsers" as const,
    subKey: "activeUsers" as const,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Usuarios",
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
    subLabel: "Proximos",
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

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.analytics.platformStats.useQuery();
  const { data: activity, isLoading: activityLoading } =
    trpc.analytics.recentActivity.useQuery();
  const { data: growth, isLoading: growthLoading } =
    trpc.analytics.userGrowth.useQuery();
  const { data: contentByModule, isLoading: contentLoading } =
    trpc.analytics.contentByModule.useQuery();
  const { data: topItems, isLoading: topItemsLoading } =
    trpc.analytics.libraryTopItems.useQuery();

  const pieData = contentByModule
    ? Object.entries(contentByModule)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: MODULE_LABELS[key] ?? key,
          value,
        }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            Metricas e visao geral da plataforma
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
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Crescimento de Usuarios
            </h2>
          </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Distribuicao por Modulo
            </h2>
          </div>
          {contentLoading ? (
            <LoadingSkeleton variant="card" rows={3} />
          ) : !pieData.length ? (
            <p className="text-sm text-gray-500">
              Sem dados de conteudo.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={true}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Top Biblioteca
            </h2>
          </div>
          {topItemsLoading ? (
            <LoadingSkeleton variant="list" rows={5} />
          ) : !topItems?.length ? (
            <p className="text-sm text-gray-500">
              Nenhum item na biblioteca.
            </p>
          ) : (
            <div className="space-y-2">
              {topItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md border px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-400 w-6">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-500">
                        {MATERIAL_TYPE_LABELS[item.materialType] ??
                          item.materialType}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {item.downloadCount} downloads
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
