// app/api/financeiro/classificar/route.ts
// Next.js 16 + TypeScript strict
// C3.5.2 — Classificação Contábil Harvan
// Runtime-only | Equação Y aplicada

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ClassificacaoInput = {
  evento_id: string;
  conta_codigo: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ClassificacaoInput;

    const { evento_id, conta_codigo } = body;

    if (!evento_id || !conta_codigo) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: conta } = await supabase
      .from("plano_contas_biofinanceiro")
      .select("id")
      .eq("codigo", conta_codigo)
      .eq("ativo", true)
      .single();

    if (!conta) {
      return NextResponse.json(
        { error: "Conta não encontrada" },
        { status: 404 }
      );
    }

    await supabase
      .from("eventos_financeiros")
      .update({ conta_id: conta.id })
      .eq("id", evento_id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro classificação Harvan:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
