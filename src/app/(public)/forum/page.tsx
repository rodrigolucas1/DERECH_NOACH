"use client";

import { Suspense } from "react";
import Link from "next/link";
import { trpc } from "@/client/lib/trpc";
import { MessageCircle } from "lucide-react";

function ForumSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-28 rounded bg-gray-200" />
        <div className="h-4 w-48 rounded bg-gray-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function ForumContent() {
  const { data: categories, isLoading } = trpc.forum.categories.useQuery();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fórum</h1>
        <p className="mt-2 text-gray-600">Participe das discussões da comunidade</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !categories?.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhuma categoria disponível.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/forum/${cat.slug}`}
              className="group rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{cat.description}</p>
              )}
              <p className="mt-4 text-xs text-gray-400">
                {cat._count.topics} {cat._count.topics === 1 ? "tópico" : "tópicos"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={<ForumSkeleton />}>
      <ForumContent />
    </Suspense>
  );
}
