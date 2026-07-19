"use client";

import { Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import { Library, FileText, Video, Headphones, ExternalLink, Download, Search } from "lucide-react";
import { useState } from "react";

const typeIcons: Record<string, typeof Library> = {
  DOCUMENT: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
  LINK: ExternalLink,
};

function LibrarySkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 rounded bg-gray-200" />
        <div className="h-4 w-56 rounded bg-gray-200" />
      </div>
      <div className="mb-6 h-10 w-full max-w-md rounded-lg bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function LibraryContent() {
  const [search, setSearch] = useState("");
  const { data: categories } = trpc.library.categories.useQuery();
  const { data: authors } = trpc.library.authors.useQuery();
  const { data, isLoading } = trpc.library.list.useQuery({ limit: 50, search: search || undefined });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Biblioteca Digital</h1>
        <p className="mt-2 text-gray-600">Livros, documentos, vídeos e áudios</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar na biblioteca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {categories?.length ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat.id} className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
              {cat.name} ({cat._count.items})
            </span>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-lg bg-gray-200" />)}
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Library className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => {
            const Icon = typeIcons[item.materialType] ?? FileText;
            return (
              <div key={item.id} className="group rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gray-50 p-2"><Icon className="h-5 w-5 text-gray-600" /></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{item.title}</h3>
                    {item.author && <p className="text-xs text-gray-500">{item.author.name}</p>}
                    {item.category && <p className="text-xs text-purple-600">{item.category.name}</p>}
                    {item.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description}</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      {item.pageCount && <span>{item.pageCount} pág.</span>}
                      {item.duration && <span>{Math.floor(item.duration / 60)}min</span>}
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />{item.downloadCount}</span>
                    </div>
                    {item.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <span key={t.tag.name} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{t.tag.name}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibrarySkeleton />}>
      <LibraryContent />
    </Suspense>
  );
}
