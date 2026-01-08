import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ativo: true, // 🔑 LIBERA O HUB
    status: "ok",
    rota: "assinaturas/status",
    timestamp: new Date().toISOString(),
  });
}
