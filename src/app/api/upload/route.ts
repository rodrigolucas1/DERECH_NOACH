import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Production considerations:
// - Use S3/R2/Cloudflare for storage instead of the local filesystem.
// - Serve uploads through a CDN with signed URLs and expiry.
// - Consider virus scanning (e.g., ClamAV) before persisting files.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// Simple in-memory rate limiter: max 10 uploads per user per minute.
const uploadTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = uploadTimestamps.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  uploadTimestamps.set(userId, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx. 50MB)." }, { status: 400 });
    }

    if (isRateLimited(session.user.id)) {
      return NextResponse.json({ error: "Limite de uploads atingido. Tente novamente em 1 minuto." }, { status: 429 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload." }, { status: 500 });
  }
}