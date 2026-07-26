"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { Heart, MapPin, Calendar, Users, CheckCircle, Clock } from "lucide-react";

function VolunteerSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function VolunteerContent() {
  const { data: opportunities, isLoading } = trpc.volunteer.opportunityList.useQuery();

  const utils = trpc.useUtils();

  const signup = trpc.volunteer.signup.useMutation({
    onSuccess: () => {
      utils.volunteer.opportunityList.invalidate();
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Voluntariado</h1>
        <p className="mt-2 text-gray-600">Encontre oportunidades para servir a comunidade</p>
      </FadeIn>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !opportunities?.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhuma oportunidade disponível no momento</p>
        </div>
      ) : (
        <StaggerContainer className="space-y-4">
          {opportunities.map((opp) => {
            const spotsLeft =
              opp.maxVolunteers != null
                ? Math.max(0, opp.maxVolunteers - (opp._count?.signups ?? 0))
                : null;

            return (
              <StaggerItem key={opp.id}>
                <AnimatedCard className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{opp.title}</h2>

                      {opp.description && (
                        <p className="mt-2 text-sm text-gray-600">{opp.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                        {opp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opp.location}
                          </span>
                        )}
                        {opp.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(opp.startDate).toLocaleDateString("pt-BR")}
                            {opp.endDate &&
                              ` - ${new Date(opp.endDate).toLocaleDateString("pt-BR")}`}
                          </span>
                        )}
                        {spotsLeft !== null && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {spotsLeft > 0
                              ? `${spotsLeft} vaga${spotsLeft !== 1 ? "s" : ""} disponível${spotsLeft !== 1 ? "eis" : ""}`
                              : "Lotado"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {spotsLeft !== null && spotsLeft <= 0 ? (
                        <Button variant="outline" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Lotado
                        </Button>
                      ) : (
                        <Button
                          onClick={() => signup.mutate({ opportunityId: opp.id })}
                          disabled={signup.isPending}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Inscrever-se
                        </Button>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}

export default function VolunteerPage() {
  return (
    <Suspense fallback={<VolunteerSkeleton />}>
      <VolunteerContent />
    </Suspense>
  );
}
