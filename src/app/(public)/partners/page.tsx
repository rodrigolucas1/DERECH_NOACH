"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/client/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/client/components/motion";
import { AnimatedCard } from "@/client/components/motion/AnimatedCard";
import { Building2, ExternalLink, ChevronDown, ChevronUp, Users } from "lucide-react";

function PartnersSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-44 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

function PartnersContent() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: partners, isLoading } = trpc.partner.list.useQuery();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <FadeIn className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Parceiros</h1>
        <p className="mt-2 text-gray-600">Instituições que apoiam nossa missão</p>
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !partners?.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Nenhuma instituição parceira</p>
        </div>
      ) : (
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const isExpanded = expandedId === partner.id;
            const repCount = partner._count?.representatives ?? 0;

            return (
              <StaggerItem key={partner.id}>
                <AnimatedCard className="flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
                  {partner.logoUrl ? (
                    <div className="flex h-32 items-center justify-center bg-gray-50 p-4">
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-gray-50">
                      <Building2 className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-semibold text-gray-900">{partner.name}</h2>

                    {partner.description && (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">
                        {partner.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            Website
                          </Button>
                        </a>
                      )}

                      {repCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(partner.id)}
                        >
                          <Users className="mr-1.5 h-3.5 w-3.5" />
                          {repCount}{" "}
                          {repCount === 1 ? "Representante" : "Representantes"}
                          {isExpanded ? (
                            <ChevronUp className="ml-1 h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="ml-1 h-3.5 w-3.5" />
                          )}
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

export default function PartnersPage() {
  return (
    <Suspense fallback={<PartnersSkeleton />}>
      <PartnersContent />
    </Suspense>
  );
}
