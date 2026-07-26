"use client";

import { Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import {
  Search,
  Clock,
  Trash2,
  Activity,
  BookOpen,
  Calendar,
  Library,
  Newspaper,
  MapPin,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { Button } from "@/components/ui/button";

const ACTIVITY_ICONS: Record<string, typeof BookOpen> = {
  study: BookOpen,
  event: Calendar,
  library: Library,
  news: Newspaper,
  community: MapPin,
  search: Search,
};

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const MOCK_ACTIVITIES: ActivityItem[] = [];

function HistorySkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-32 rounded bg-gray-200" />
        <div className="h-4 w-56 rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function HistoryContent() {
  const utils = trpc.useContext();

  const { data: searches, isLoading: searchesLoading } =
    trpc.search.history.useQuery();

  const clearHistory = trpc.search.clearHistory.useMutation({
    onSuccess: () => {
      utils.search.history.invalidate();
    },
  });

  const activities = MOCK_ACTIVITIES;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Histórico</h1>
          <p className="mt-2 text-gray-600">
            Suas atividades e pesquisas recentes
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => clearHistory.mutate()}
          disabled={clearHistory.isPending}
        >
          <Trash2 className="h-4 w-4" />
          Limpar Histórico
        </Button>
      </FadeIn>

      <div className="space-y-8">
        <FadeIn delay={0.1}>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Pesquisas Recentes
            </h2>
          </div>

          {searchesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          ) : !searches?.length ? (
            <AnimatedCard className="rounded-lg border bg-white p-8 text-center">
              <Search className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                Nenhuma pesquisa recente
              </p>
            </AnimatedCard>
          ) : (
            <StaggerContainer className="space-y-2">
              {searches.map((item, i) => (
                <StaggerItem key={i}>
                  <AnimatedCard className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm">
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700">
                      {item.query}
                    </span>
                    {item.createdAt && (
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Atividades</h2>
          </div>

          {activities.length === 0 ? (
            <AnimatedCard className="rounded-lg border bg-white p-8 text-center">
              <Activity className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">
                Nenhuma atividade registrada
              </p>
            </AnimatedCard>
          ) : (
            <StaggerContainer className="space-y-2">
              {activities.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type] ?? Activity;
                return (
                  <StaggerItem key={item.id}>
                    <AnimatedCard className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm">
                      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="flex-1 text-sm text-gray-700">
                        {item.description}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </AnimatedCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </FadeIn>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<HistorySkeleton />}>
      <HistoryContent />
    </Suspense>
  );
}
