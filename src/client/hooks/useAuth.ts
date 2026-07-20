"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;

  return {
    user: user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    role: (user?.role as string | null) ?? null,
    tenantId: (user?.tenantId as string | null) ?? null,
    isAdmin: user?.role === "ADMIN",
    isLeader: user?.role === "LEADER",
    isMember: user?.role === "MEMBER",
    canAccessAdmin: user?.role === "ADMIN" || user?.role === "LEADER",
    signIn,
    signOut,
  };
}
