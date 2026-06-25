// app/api/cfo/route.ts
// PecuariaTech – API CFO Inteligente Premium

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("❌ Supabase env vars missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function respond(data: any, message?: string, status = 200) {
  return NextResponse.json({
    ok: status < 400,
    message: message || (status < 400 ? "Operacao concluida" : "Erro na operacao"),
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const supabase = getSupabase();

    // Buscar resumo financeiro consolidado (usando a view)
    const { data, error } = await supabase
      .from("vw_financeiro_resumo")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (error) {
      console.error("[CFO GET] Erro:", error);
      return respond(null, error.message, 500);
    }

    // Adicionar análise básica (ROI, margem, etc. já estão na view)
    // Você pode enriquecer com dados de outras views se quiser
    return respond(data || {});
  } catch (err: any) {
    console.error("[CFO GET] Excecao:", err);
    return respond(null, err?.message || "Erro interno", 500);
  }
}

// Opcional: endpoint para análise detalhada (receita/despesa mensal)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, periodo } = body;
    if (!user_id) {
      return respond(null, "user_id e obrigatorio", 400);
    }

    const supabase = getSupabase();
    // Exemplo: buscar lançamentos por período
    let query = supabase.from("financeiro").select("*").eq("user_id", user_id);
    if (periodo) {
      // Se periodo for 'mes', filtra último mês
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - 1);
      query = query.gte("data_lancamento", dataLimite.toISOString().split("T")[0]);
    }

    const { data, error } = await query.order("data_lancamento", { ascending: false });
    if (error) {
      console.error("[CFO POST] Erro:", error);
      return respond(null, error.message, 500);
    }

    // Calcular totais
    const totalReceitas = data?.filter((i: any) => i.tipo === "entrada").reduce((acc: number, i: any) => acc + i.valor, 0) || 0;
    const totalDespesas = data?.filter((i: any) => i.tipo === "saida").reduce((acc: number, i: any) => acc + i.valor, 0) || 0;
    const lucro = totalReceitas - totalDespesas;

    return respond({
      receitas: totalReceitas,
      despesas: totalDespesas,
      lucro,
      transacoes: data || [],
    });
  } catch (err: any) {
    console.error("[CFO POST] Excecao:", err);
    return respond(null, err?.message || "Erro ao processar", 500);
  }
}
