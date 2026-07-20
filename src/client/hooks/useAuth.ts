"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    role: user?.role ?? null,
    tenantId: user?.tenantId ?? null,
    isAdmin: user?.role === "ADMIN",
    isLeader: user?.role === "LEADER",
    isMember: user?.role === "MEMBER",
    canAccessAdmin: user?.role === "ADMIN" || user?.role === "LEADER",
    signIn,
    signOut,
  };
}
