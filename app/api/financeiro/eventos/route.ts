// app/api/financeiro/eventos/route.ts
// Next.js 16 + TypeScript strict
// C3.5.1 — Ingestão de Eventos Financeiros (HARVAN)
// Runtime-only | Equação Y aplicada

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type EventoFinanceiroInput = {
  user_id: string;
  origem: string;
  tipo: "entrada" | "saida" | "ajuste";
  valor: number;
  data_evento: string;
  animal_id?: string;
  lote_id?: string;
  ciclo?: string;
  metadata?: Record<string, any>;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EventoFinanceiroInput;

    const {
      user_id,
      origem,
      tipo,
      valor,
      data_evento,
      animal_id,
      lote_id,
      ciclo,
      metadata,
    } = body;

    // ===============================
    // Validação mínima (HARVAN observa)
    // ===============================
    if (!user_id || !origem || !tipo || !valor || !data_evento) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    // ===============================
    // Supabase (SERVER ONLY)
    // ===============================
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ===============================
    // Inserção do evento financeiro
    // ===============================
    await supabase.from("eventos_financeiros").insert({
      user_id,
      origem,
      tipo,
      valor,
      data_evento,
      animal_id,
      lote_id,
      ciclo,
      metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar evento financeiro:", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
