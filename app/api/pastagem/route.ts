// app/api/pastagem/route.ts
// PecuariaTech – API Pastagem Premium Ultra Nutricional
// Inclui tipo de pastagem, nutrientes, manejo e silagem

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

// GET – Listar piquetes com dados nutricionais
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const supabase = getSupabase();
    let query = supabase.from("vw_pastagem").select("*");
    if (user_id) query = query.eq("user_id", user_id);
    const { data, error } = await query;
    if (error) {
      console.error("[Pastagem GET] Erro:", error);
      return respond(null, error.message, 500);
    }
    return respond(data || []);
  } catch (err: any) {
    console.error("[Pastagem GET] Excecao:", err);
    return respond(null, err?.message || "Erro interno", 500);
  }
}

// POST – Adicionar piquete com informações nutricionais
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      nome,
      tipo_forragem,
      area,
      data_plantio,
      observacoes,
      // NOVOS CAMPOS NUTRICIONAIS
      nutriente_indicado,    // Ex: Nitrogênio, Fósforo, Potássio
      tipo_manejo,           // Ex: Rotacionado, Contínuo, Intensivo
      irrigacao,             // Ex: Sim, Não, Aspersão
      qualidade_solo,        // Ex: Alta, Média, Baixa
      observacoes_nutricao,  // Observações sobre nutrição do solo
      produtividade_estimada,// kg MS/ha/ano
      especie_animal,        // Ex: Bovino, Ovino
      capacidade_suporte,    // UA/ha
    } = body;

    if (!user_id || !nome || !area) {
      return respond(null, "Campos obrigatorios: user_id, nome, area", 400);
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("pastagem")
      .insert({
        id: crypto.randomUUID(),
        user_id,
        nome,
        tipo_forragem: tipo_forragem || null,
        area: parseFloat(area),
        data_plantio: data_plantio || new Date().toISOString().split("T")[0],
        observacoes: observacoes || null,
        // Campos nutricionais
        nutriente_indicado: nutriente_indicado || null,
        tipo_manejo: tipo_manejo || null,
        irrigacao: irrigacao || null,
        qualidade_solo: qualidade_solo || null,
        observacoes_nutricao: observacoes_nutricao || null,
        produtividade_estimada: produtividade_estimada ? parseFloat(produtividade_estimada) : null,
        especie_animal: especie_animal || null,
        capacidade_suporte: capacidade_suporte ? parseFloat(capacidade_suporte) : null,
      })
      .select()
      .single();

    if (error) {
      console.error("[Pastagem POST] Erro:", error);
      if (error.code === "PGRST204") {
        return respond(
          null,
          "Colunas nutricionais nao encontradas. Execute: ALTER TABLE pastagem ADD COLUMN nutriente_indicado TEXT; ADD COLUMN tipo_manejo TEXT; ADD COLUMN irrigacao TEXT; ADD COLUMN qualidade_solo TEXT; ADD COLUMN observacoes_nutricao TEXT; ADD COLUMN produtividade_estimada NUMERIC; ADD COLUMN especie_animal TEXT; ADD COLUMN capacidade_suporte NUMERIC;",
          500
        );
      }
      return respond(null, error.message, 500);
    }

    return respond(data, "Piquete adicionado com dados nutricionais", 201);
  } catch (err: any) {
    console.error("[Pastagem POST] Excecao:", err);
    return respond(null, err?.message || "Erro ao adicionar piquete", 500);
  }
}

// PUT – Atualizar piquete (inclui dados nutricionais)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return respond(null, "ID do piquete e obrigatorio", 400);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("pastagem")
      .update({
        ...updates,
        nutriente_indicado: updates.nutriente_indicado || null,
        tipo_manejo: updates.tipo_manejo || null,
        irrigacao: updates.irrigacao || null,
        qualidade_solo: updates.qualidade_solo || null,
        observacoes_nutricao: updates.observacoes_nutricao || null,
        produtividade_estimada: updates.produtividade_estimada ? parseFloat(updates.produtividade_estimada) : null,
        capacidade_suporte: updates.capacidade_suporte ? parseFloat(updates.capacidade_suporte) : null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("[Pastagem PUT] Erro:", error);
      return respond(null, error.message, 500);
    }
    return respond(data, "Piquete atualizado", 200);
  } catch (err: any) {
    console.error("[Pastagem PUT] Excecao:", err);
    return respond(null, err?.message || "Erro ao atualizar", 500);
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return respond(null, "ID do piquete e obrigatorio", 400);
    const supabase = getSupabase();
    const { error } = await supabase.from("pastagem").delete().eq("id", id);
    if (error) {
      console.error("[Pastagem DELETE] Erro:", error);
      return respond(null, error.message, 500);
    }
    return respond({ id }, "Piquete removido", 200);
  } catch (err: any) {
    console.error("[Pastagem DELETE] Excecao:", err);
    return respond(null, err?.message || "Erro ao remover", 500);
  }
}
