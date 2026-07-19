"use client";

import Link from "next/link";
import { trpc } from "@/client/lib/trpc";
import { MapPin, Users, Calendar } from "lucide-react";

export default function CommunitiesPage() {
  const { data: communities, isLoading } = trpc.community.list.useQuery();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comunidades</h1>
        <p className="mt-2 text-gray-600">Encontre comunidades Bnei Noach perto de você</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !communities?.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhuma comunidade encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <Link
              key={c.id}
              href={`/communities/${c.slug}`}
              className="group rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {c.coverImageUrl && (
                <img src={c.coverImageUrl} alt={c.name} className="mb-4 h-32 w-full rounded object-cover" />
              )}
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{c.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />{c.city}, {c.state}
              </p>
              {c.description && <p className="mt-2 line-clamp-2 text-sm text-gray-600">{c.description}</p>}
              <div className="mt-4 flex gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c._count.members} membros</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c._count.events} eventos</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
