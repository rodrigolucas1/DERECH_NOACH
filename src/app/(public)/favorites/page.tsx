"use client";

import { Suspense, useState, useMemo } from "react";
import { trpc } from "@/client/lib/trpc";
import {
  BookOpen,
  Calendar,
  Library,
  Newspaper,
  MapPin,
  Heart,
  X,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const TAB_TYPES = [
  { value: "all", label: "Todos" },
  { value: "STUDY", label: "Estudos" },
  { value: "EVENT", label: "Eventos" },
  { value: "LIBRARY", label: "Biblioteca" },
  { value: "NEWS", label: "Notícias" },
  { value: "COMMUNITY", label: "Comunidades" },
] as const;

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  STUDY: BookOpen,
  EVENT: Calendar,
  LIBRARY: Library,
  NEWS: Newspaper,
  COMMUNITY: MapPin,
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  STUDY: "bg-blue-100 text-blue-700",
  EVENT: "bg-green-100 text-green-700",
  LIBRARY: "bg-purple-100 text-purple-700",
  NEWS: "bg-orange-100 text-orange-700",
  COMMUNITY: "bg-teal-100 text-teal-700",
};

const TYPE_LABELS: Record<string, string> = {
  STUDY: "Estudo",
  EVENT: "Evento",
  LIBRARY: "Biblioteca",
  NEWS: "Notícia",
  COMMUNITY: "Comunidade",
};

function FavoritesSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="mb-6 h-10 w-full max-w-lg rounded-lg bg-gray-200" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

interface DisplayItem {
  entityType: string;
  entityId: string;
  title: string;
  thumbnailUrl?: string | null;
  createdAt?: Date;
}

function FavoriteCard({
  item,
  onRemove,
}: {
  item: DisplayItem;
  onRemove: (entityType: string, entityId: string) => void;
}) {
  const Icon = TYPE_ICONS[item.entityType] ?? Heart;

  return (
    <AnimatedCard className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gray-50 p-2">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE_COLORS[item.entityType] ?? "bg-gray-100 text-gray-700"}`}
            >
              {TYPE_LABELS[item.entityType] ?? item.entityType}
            </span>
            {item.createdAt && (
              <span className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(item.entityType, item.entityId)}
          title="Remover dos favoritos"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </Button>
      </div>
    </AnimatedCard>
  );
}

function FavoritesContent() {
  const [activeTab, setActiveTab] = useState("all");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.favorite.list.useQuery();

  const toggleFavorite = trpc.favorite.toggle.useMutation({
    onSuccess: () => {
      utils.favorite.list.invalidate();
    },
  });

  const displayItems = useMemo(() => {
    if (!data) return [];

    const filtered =
      activeTab === "all"
        ? data.favorites
        : data.favorites.filter((f) => f.entityType === activeTab);

    return filtered.map((fav) => {
      const entityList = data.entities[fav.entityType] ?? [];
      const entity = entityList.find((e) => e.id === fav.entityId);
      return {
        entityType: fav.entityType,
        entityId: fav.entityId,
        title: entity?.title ?? "Sem título",
        thumbnailUrl: entity?.thumbnailUrl,
        createdAt: fav.createdAt,
      };
    });
  }, [data, activeTab]);

  const handleRemove = (entityType: string, entityId: string) => {
    toggleFavorite.mutate({ entityType: entityType as any, entityId });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
        <p className="mt-2 text-gray-600">Todo o conteúdo que você salvou</p>
      </FadeIn>

      <FadeIn delay={0.1} className="mb-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as string)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {TAB_TYPES.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </FadeIn>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !displayItems.length ? (
        <FadeIn className="rounded-lg border bg-white p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-500">
            Nenhum favorito ainda
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Salve conteúdo clicando no ícone de favorito
          </p>
        </FadeIn>
      ) : (
        <StaggerContainer className="space-y-3">
          {displayItems.map((item, idx) => (
            <StaggerItem key={`${item.entityType}-${item.entityId}-${idx}`}>
              <FavoriteCard item={item} onRemove={handleRemove} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <FavoritesContent />
    </Suspense>
  );
}
