// app/api/assinatura/route.ts
// Assinatura — endpoint seguro (build-safe)
// Runtime-only | Equação Y preservada

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// GET /api/assinatura
// ===============================
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { erro: "Configuração Supabase ausente" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey);

    // 🔹 MOCK SEGURO (fase de estabilização)
    return NextResponse.json({
      status: "ok",
      plano: "trial",
      origem: "mock-runtime",
    });
  } catch (err) {
    console.error("Erro /api/assinatura:", err);
    return NextResponse.json(
      { erro: "Erro interno em assinatura" },
      { status: 500 }
    );
  }
}
