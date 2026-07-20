"use client";

import { Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import { HandHeart, Users } from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function TzedakaSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-28 rounded bg-gray-200" />
        <div className="h-4 w-48 rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function TzedakaContent() {
  const { data: campaigns, isLoading } = trpc.tzedaka.listPublic.useQuery();

  const activeCampaigns = campaigns?.filter((c) => c.status === "ACTIVE") ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tzedaká</h1>
        <p className="mt-2 text-gray-600">Ajude a comunidade com suas doações</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !activeCampaigns.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <HandHeart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhuma campanha de Tzedaká disponível no momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeCampaigns.map((c) => {
            const current = Number(c.currentAmount ?? 0);
            const goal = Number(c.goalAmount ?? 0);
            const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

            return (
              <div
                key={c.id}
                className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {c.coverUrl && (
                  <img
                    src={c.coverUrl}
                    alt={c.title}
                    className="mb-4 h-48 w-full rounded-md object-cover"
                  />
                )}

                <h2 className="text-xl font-semibold text-gray-900">{c.title}</h2>

                {c.description && (
                  <p className="mt-2 text-sm text-gray-600">{c.description}</p>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>{formatCurrency(current)}</span>
                    <span>{goal > 0 ? formatCurrency(goal) : "Sem meta definida"}</span>
                  </div>
                  {c.goalAmount && (
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                  <Users className="h-3.5 w-3.5" />
                  {c._count.donations} {c._count.donations === 1 ? "doador" : "doadores"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TzedakaPage() {
  return (
    <Suspense fallback={<TzedakaSkeleton />}>
      <TzedakaContent />
    </Suspense>
  );
}
