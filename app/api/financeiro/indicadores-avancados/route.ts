// Next.js 16 + TypeScript strict

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ===============================
// SUPABASE SERVER CLIENT (USER CONTEXT)
// ===============================
function getSupabaseServerClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ ANON, NÃO SERVICE
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

// ===============================
// GET /api/financeiro/indicadores-avancados
// ===============================
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente" }, { status: 401 });
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
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }

    // ===============================
    // BUSCAR INDICADORES (RLS ATIVO)
    // ===============================
    const { data, error } = await supabase
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

    if (error) {
      console.error("Erro indicadores CFO:", error);
      return NextResponse.json(
        { error: "Erro ao buscar indicadores financeiros" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      indicadores: data,
    });
  } catch (err) {
    console.error("Erro inesperado CFO:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
