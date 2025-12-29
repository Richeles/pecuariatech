// app/api/ultra/route.ts
// Ultra — Endpoint stub seguro
// Build-safe | Runtime-only | Equação Y preservada

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    modulo: "Ultra",
    mensagem: "Endpoint ativo (stub seguro).",
  });
}
