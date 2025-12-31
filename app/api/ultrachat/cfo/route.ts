// CAMINHO: app/api/ultrachat/cfo/route.ts
// PecuariaTech Autônomo — UltraChat CFO (V1)
// Linguagem natural + dados reais + decisão autônoma

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ===============================
// SUPABASE SERVER CLIENT (TOKEN REAL)
// ===============================
function getSupabaseServerClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

// ===============================
// POST /api/ultrachat/cfo
// ===============================
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token ausente" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseServerClient(token);

    // ===============================
    // VALIDAR USUÁRIO
    // ===============================
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida" },
        { status: 401 }
      );
    }

    // ===============================
    // INPUT DO USUÁRIO
    // ===============================
    const body = await req.json();
    const pergunta: string = body?.pergunta;

    if (!pergunta || pergunta.trim().length < 3) {
      return NextResponse.json(
        { error: "Pergunta inválida" },
        { status: 400 }
      );
    }

    // ===============================
    // BUSCAR INDICADORES FINANCEIROS
    // ===============================
    const { data: indicadores } = await supabase
      .from("financeiro_indicadores_view")
      .select(
        `
        receita_total,
        custo_total,
        resultado_operacional,
        margem_percentual
      `
      )
      .eq("user_id", user.id)
      .single();

    // ===============================
    // BUSCAR ÚLTIMA DECISÃO DO CFO
    // ===============================
    const { data: decisao } = await supabase
      .from("cfo_decisoes")
      .select("decisao, prioridade")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .single();

    // ===============================
    // RESPOSTA INTELIGENTE (V1)
    // ===============================
    let resposta = "Estou analisando sua situação financeira atual.";

    if (decisao?.decisao) {
      resposta = decisao.decisao;
    } else if (indicadores) {
      resposta = `No momento, seu resultado operacional é ${indicadores.resultado_operacional}, com margem de ${indicadores.margem_percentual}%.`;
    }

    return NextResponse.json({
      contexto: "pecuariatech_autonomo_cfo",
      pergunta,
      resposta,
    });
  } catch (err) {
    console.error("Erro UltraChat CFO:", err);
    return NextResponse.json(
      { error: "Erro interno do UltraChat CFO" },
      { status: 500 }
    );
  }
}
