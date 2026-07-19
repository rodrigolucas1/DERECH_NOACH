"use client";

import { Suspense } from "react";
import Link from "next/link";
import { trpc } from "@/client/lib/trpc";
import { Newspaper, Tag } from "lucide-react";

function NewsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-28 rounded bg-gray-200" />
        <div className="h-4 w-56 rounded bg-gray-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function NewsContent() {
  const { data, isLoading } = trpc.news.list.useQuery({ limit: 30 });
  const { data: categories } = trpc.news.categories.useQuery();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notícias</h1>
        <p className="mt-2 text-gray-600">Fique por dentro das novidades da comunidade</p>
      </div>

      {categories?.length ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat.id} className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-white" style={{ backgroundColor: cat.color ?? "#6b7280" }}>
              {cat.name}
            </span>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhuma notícia publicada.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((a) => (
            <Link
              key={a.id}
              href={`/news/${a.slug}`}
              className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {a.coverUrl && (
                <img src={a.coverUrl} alt={a.title} className="h-40 w-full object-cover" />
              )}
              <div className="p-5">
                {a.category && (
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white mb-2" style={{ backgroundColor: a.category.color ?? "#6b7280" }}>
                    {a.category.name}
                  </span>
                )}
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{a.title}</h2>
                {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{a.excerpt}</p>}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{a.author?.name}</span>
                  <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("pt-BR") : ""}</span>
                </div>
                {a.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.tags.map((t) => (
                      <span key={t.tag.name} className="flex items-center gap-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        <Tag className="h-2.5 w-2.5" />{t.tag.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<NewsSkeleton />}>
      <NewsContent />
    </Suspense>
  );
}
