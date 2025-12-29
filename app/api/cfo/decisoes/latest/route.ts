// app/api/cfo/decisoes/latest/route.ts
// PecuariaTech CFO — Última decisão gerada
// Runtime-only | Build-safe | Equação Y aplicada

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ===============================
// GET /api/cfo/decisoes/latest
// ===============================
export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("ENV CFO ausente (decisoes/latest)");
      return NextResponse.json(
        { erro: "Configuração do CFO indisponível" },
        { status: 500 }
      );
    }

    // 🔐 Supabase criado apenas em runtime
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("cfo_decisoes")
      .select(
        `
        id,
        created_at,
        tipo,
        resumo,
        impacto_estimado,
        prioridade
        `
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.warn("Nenhuma decisão encontrada");
      return NextResponse.json({
        status: "ok",
        mensagem: "Nenhuma decisão registrada ainda",
      });
    }

    return NextResponse.json({
      status: "ok",
      sistema: "PecuariaTech CFO",
      decisao: data,
    });
  } catch (err) {
    console.error("Erro API CFO decisões:", err);
    return NextResponse.json(
      { erro: "Erro interno na API CFO (decisões)" },
      { status: 500 }
    );
  }
}
