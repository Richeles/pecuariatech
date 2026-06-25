// app/api/financeiro/route.ts
// PecuariaTech – API Financeiro Premium

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
    const limit = parseInt(searchParams.get("limit") || "100");
    const supabase = getSupabase();
    let query = supabase.from("vw_financeiro_resumo").select("*");
    if (user_id) query = query.eq("user_id", user_id);
    const { data, error } = await query.limit(limit);
    if (error) {
      console.error("[Financeiro GET] Erro:", error);
      return respond(null, error.message, 500);
    }
    return respond(data || []);
  } catch (err: any) {
    console.error("[Financeiro GET] Excecao:", err);
    return respond(null, err?.message || "Erro interno", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, descricao, tipo, valor, data_lancamento, categoria } = body;
    if (!user_id || !descricao || !tipo || !valor) {
      return respond(null, "Campos obrigatorios: user_id, descricao, tipo, valor", 400);
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("financeiro")
      .insert({
        id: crypto.randomUUID(),
        user_id,
        descricao,
        tipo,
        valor: parseFloat(valor),
        data_lancamento: data_lancamento || new Date().toISOString().split("T")[0],
        categoria: categoria || null,
      })
      .select()
      .single();
    if (error) {
      console.error("[Financeiro POST] Erro:", error);
      return respond(null, error.message, 500);
    }
    return respond(data, "Lancamento registrado", 201);
  } catch (err: any) {
    console.error("[Financeiro POST] Excecao:", err);
    return respond(null, err?.message || "Erro ao lancar", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return respond(null, "ID do lancamento e obrigatorio", 400);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("financeiro")
      .update({ ...updates })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("[Financeiro PUT] Erro:", error);
      return respond(null, error.message, 500);
    }
    return respond(data, "Lancamento atualizado", 200);
  } catch (err: any) {
    console.error("[Financeiro PUT] Excecao:", err);
    return respond(null, err?.message || "Erro ao atualizar", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return respond(null, "ID do lancamento e obrigatorio", 400);
    const supabase = getSupabase();
    const { error } = await supabase.from("financeiro").delete().eq("id", id);
    if (error) {
      console.error("[Financeiro DELETE] Erro:", error);
      return respond(null, error.message, 500);
    }
    return respond({ id }, "Lancamento removido", 200);
  } catch (err: any) {
    console.error("[Financeiro DELETE] Excecao:", err);
    return respond(null, err?.message || "Erro ao remover", 500);
  }
}
