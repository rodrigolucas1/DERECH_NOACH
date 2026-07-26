"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import { trpc } from "@/client/lib/trpc";
import {
  Search,
  Clock,
  TrendingUp,
  BookOpen,
  Calendar,
  Library,
  Newspaper,
  MapPin,
  X,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_TYPES = [
  { value: "all", label: "Todos", icon: Search },
  { value: "STUDY", label: "Estudos", icon: BookOpen },
  { value: "EVENT", label: "Eventos", icon: Calendar },
  { value: "LIBRARY", label: "Biblioteca", icon: Library },
  { value: "NEWS", label: "Notícias", icon: Newspaper },
  { value: "COMMUNITY", label: "Comunidades", icon: MapPin },
] as const;

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

function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>
      <div className="mb-6 h-12 w-full rounded-lg bg-gray-200" />
      <div className="mb-6 h-10 w-full max-w-lg rounded-lg bg-gray-200" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

interface FlatResult {
  id: string;
  title: string;
  description?: string;
  type: string;
  date?: string;
}

function ResultCard({ item }: { item: FlatResult }) {
  return (
    <AnimatedCard className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {item.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE_COLORS[item.type] ?? "bg-gray-100 text-gray-700"}`}
            >
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            {item.date && (
              <span className="text-xs text-gray-400">
                {new Date(item.date).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}

function SearchContent() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchMutation = trpc.search.global.useMutation();

  const { data: recentSearches } = trpc.search.history.useQuery();
  const { data: popularSearches } = trpc.search.popular.useQuery();

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchMutation.mutate({
        query: searchQuery,
        module: activeTab === "all" ? undefined : activeTab,
      });
    }
  }, [searchQuery, activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && debounceRef.current) {
      clearTimeout(debounceRef.current);
      setSearchQuery(query);
    }
  };

  const handleRecentSearch = (q: string) => {
    setQuery(q);
    setSearchQuery(q);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchQuery("");
  };

  const searchData = searchMutation.data;
  const isSearching = searchMutation.isPending;

  const flatResults: FlatResult[] = [];
  if (searchData) {
    for (const s of searchData.studies ?? [])
      flatResults.push({ id: s.id, title: s.title, description: s.description ?? undefined, type: "STUDY" });
    for (const e of searchData.events ?? [])
      flatResults.push({ id: e.id, title: e.title, description: e.description ?? undefined, type: "EVENT", date: e.dateTime?.toString() });
    for (const l of searchData.library ?? [])
      flatResults.push({ id: l.id, title: l.title, description: l.description ?? undefined, type: "LIBRARY" });
    for (const n of searchData.news ?? [])
      flatResults.push({ id: n.id, title: n.title, description: n.excerpt ?? undefined, type: "NEWS", date: n.publishedAt?.toString() });
    for (const c of searchData.community ?? [])
      flatResults.push({ id: c.id, title: c.name, description: c.description ?? undefined, type: "COMMUNITY" });
  }

  const hasSearched = searchQuery.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pesquisa Global</h1>
        <p className="mt-2 text-gray-600">
          Busque estudos, eventos, biblioteca, notícias e comunidades
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="O que você está procurando?"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 pl-11 pr-10 text-base"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.15} className="mb-8">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as string); }}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {TAB_TYPES.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </FadeIn>

      {hasSearched ? (
        isSearching ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : flatResults.length === 0 ? (
          <FadeIn className="rounded-lg border bg-white p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">
              Nenhum resultado encontrado
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Tente usar termos diferentes ou verifique a ortografia
            </p>
          </FadeIn>
        ) : (
          <div>
            <p className="mb-4 text-sm text-gray-500">
              {flatResults.length} resultado{flatResults.length !== 1 ? "s" : ""} encontrado{flatResults.length !== 1 ? "s" : ""}
            </p>
            <StaggerContainer className="space-y-3">
              {flatResults.map((item) => (
                <StaggerItem key={item.id}>
                  <ResultCard item={item} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )
      ) : (
        <div className="space-y-8">
          {recentSearches && recentSearches.length > 0 && (
            <FadeIn>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Clock className="h-4 w-4 text-gray-400" />
                Pesquisas Recentes
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentSearch(item.query)}
                    className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Clock className="h-3 w-3 text-gray-400" />
                    {item.query}
                  </button>
                ))}
              </div>
            </FadeIn>
          )}

          {popularSearches && popularSearches.length > 0 && (
            <FadeIn delay={0.1}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                Pesquisas Populares
              </h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentSearch(item.query)}
                    className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    {item.query}
                  </button>
                ))}
              </div>
            </FadeIn>
          )}

          {!recentSearches?.length && !popularSearches?.length && (
            <FadeIn className="rounded-lg border bg-white p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">
                Digite algo para começar a pesquisar
              </p>
            </FadeIn>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
