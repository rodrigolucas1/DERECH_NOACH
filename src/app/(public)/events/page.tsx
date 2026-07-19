"use client";

import Link from "next/link";
import { trpc } from "@/client/lib/trpc";
import { Calendar, MapPin, Video, Users } from "lucide-react";

export default function EventsPage() {
  const { data, isLoading } = trpc.event.list.useQuery({ upcoming: true, limit: 30 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
        <p className="mt-2 text-gray-600">Próximos eventos da comunidade</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhum evento agendado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="flex items-start gap-4 rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <span className="text-xs font-medium">{new Date(e.dateTime).toLocaleDateString("pt-BR", { month: "short" })}</span>
                <span className="text-xl font-bold">{new Date(e.dateTime).getDate()}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{e.title}</h2>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(e.dateTime).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {e.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{e.location}</span>}
                  {e.eventType !== "IN_PERSON" && <span className="flex items-center gap-1"><Video className="h-4 w-4" />{e.eventType}</span>}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{e._count.registrations} inscritos</span>
                  {e.community && <span>{e.community.name}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
