import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token inválido." },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Token expirado. Solicite uma nova redefinição." },
        { status: 400 }
      );
    }

    const userId = verificationToken.identifier.replace("password-reset:", "");
    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json(
      { message: "Senha redefinida com sucesso." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao redefinir senha." },
      { status: 500 }
    );
  }
}
