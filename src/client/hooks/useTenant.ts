"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/client/lib/trpc";

export function useTenant() {
  const { data: tenant, isLoading } = trpc.tenant.getCurrent.useQuery();

  return {
    tenant,
    isLoading,
    tenantId: tenant?.id ?? null,
    tenantSlug: tenant?.slug ?? null,
  };
}
