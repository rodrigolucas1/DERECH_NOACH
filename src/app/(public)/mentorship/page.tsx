"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { GraduationCap, Tag, Clock, CheckCircle } from "lucide-react";

function MentorshipSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function MentorshipContent() {
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const { data: mentors, isLoading } = trpc.mentorship.mentorList.useQuery();

  const requestMentorship = trpc.mentorship.requestMentorship.useMutation({
    onSuccess: (_data, variables) => {
      setRequestedIds((prev) => new Set(prev).add(variables.mentorId));
    },
  });

  const availableCount = mentors?.filter((m) => m.isAvailable ?? true).length ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mentoria</h1>
        <p className="mt-2 text-gray-600">
          Conecte-se com mentores experientes da comunidade
        </p>
        {!isLoading && (
          <p className="mt-1 text-sm text-blue-600 font-medium">
            {availableCount} {availableCount === 1 ? "mentor disponível" : "mentores disponíveis"}
          </p>
        )}
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !mentors?.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhum mentor disponível no momento</p>
        </div>
      ) : (
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => {
            const isRequested = requestedIds.has(mentor.id);
            const isAvailable = mentor.isAvailable ?? true;

            return (
              <StaggerItem key={mentor.id}>
                <AnimatedCard className="flex h-full flex-col rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    {mentor.user?.image ? (
                      <img
                        src={mentor.user.image}
                        alt={mentor.user.name ?? "Mentor"}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-semibold text-gray-900">{mentor.user?.name ?? "Mentor"}</h2>
                      {!isAvailable && (
                        <span className="text-xs text-gray-400">Indisponível</span>
                      )}
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className="mt-3 line-clamp-3 flex-1 text-sm text-gray-600">{mentor.bio}</p>
                  )}

                  {mentor.expertise && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        <Tag className="h-3 w-3" />
                        {mentor.expertise}
                      </span>
                    </div>
                  )}

                  <div className="mt-4">
                    {isRequested ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Solicitação Enviada
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={!isAvailable || requestMentorship.isPending}
                        onClick={() =>
                          requestMentorship.mutate({ mentorId: mentor.id })
                        }
                      >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Solicitar Mentoria
                      </Button>
                    )}
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

export default function MentorshipPage() {
  return (
    <Suspense fallback={<MentorshipSkeleton />}>
      <MentorshipContent />
    </Suspense>
  );
}
