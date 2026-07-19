import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Se o e-mail estiver cadastrado, você receberá as instruções." },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.verificationToken.deleteMany({
      where: { identifier: `password-reset:${user.id}` },
    });

    await db.verificationToken.create({
      data: {
        identifier: `password-reset:${user.id}`,
        token,
        expires,
      },
    });

    // TODO: Send email with reset link via Resend
    // For now, log the token in development
    if (process.env.NODE_ENV === "development") {
      console.log(`🔑 Password reset token for ${user.email}: ${token}`);
      console.log(`🔗 Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`);
    }

    return NextResponse.json(
      { message: "Se o e-mail estiver cadastrado, você receberá as instruções." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar solicitação." },
      { status: 500 }
    );
  }
}
