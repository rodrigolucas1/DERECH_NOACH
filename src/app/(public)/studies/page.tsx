"use client";

import { trpc } from "@/client/lib/trpc";
import { BookOpen, FileText, Video, Headphones, ExternalLink, Download } from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, typeof BookOpen> = {
  DOCUMENT: FileText,
  VIDEO: Video,
  AUDIO: Headphones,
  LINK: ExternalLink,
};

export default function StudiesPage() {
  const { data: categories } = trpc.study.categories.useQuery();
  const { data: materials, isLoading } = trpc.study.list.useQuery({ limit: 50 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Estudos</h1>
        <p className="mt-2 text-gray-600">Materiais de estudo sobre as Sete Leis de Noé</p>
      </div>

      {categories?.length ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat.id} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {cat.name} ({cat._count.materials})
            </span>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !materials?.items.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhum material disponível.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.items.map((m) => {
            const Icon = typeIcons[m.materialType] ?? FileText;
            return (
              <div key={m.id} className="group rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gray-50 p-2"><Icon className="h-5 w-5 text-gray-600" /></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{m.title}</h3>
                    {m.category && <p className="text-xs text-blue-600">{m.category.name}</p>}
                    {m.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{m.description}</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>{m.uploadedBy?.name}</span>
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />{m.downloadCount}</span>
                    </div>
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
