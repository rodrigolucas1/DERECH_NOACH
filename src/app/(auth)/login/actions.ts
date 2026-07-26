"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/server/auth";
import { db } from "@/server/db/client";

export interface LoginResult {
  error: string;
  redirectUrl: string | null;
}

export async function loginAction(
  _prev: LoginResult,
  formData: FormData
): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Preencha todos os campos.", redirectUrl: null };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "E-mail ou senha incorretos.", redirectUrl: null };
    }
    throw err;
  }

  const user = await db.user.findUnique({
    where: { email },
    include: {
      tenantMembers: {
        select: { role: true },
        take: 1,
      },
    },
  });

  const role = user?.tenantMembers?.[0]?.role;

  if (role && ["ADMIN", "LEADER"].includes(role)) {
    return { error: "", redirectUrl: "/admin/dashboard" };
  }

  return { error: "", redirectUrl: "/" };
}
