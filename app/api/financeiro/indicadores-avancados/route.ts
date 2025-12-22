// CAMINHO: app/api/financeiro/indicadores-avancados/route.ts
// Next.js 16 + TypeScript strict

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ===============================
// SUPABASE SERVER CLIENT (RUNTIME)
// ===============================
function getSupabaseServerClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token ausente" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseServerClient(token);

    // ===============================
    // VALIDAR USUÁRIO PELO TOKEN
    // ===============================
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida" },
        { status: 401 }
      );
    }

    // ===============================
    // BUSCAR INDICADORES FINANCEIROS
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
      console.error("Erro ao buscar indicadores:", error);
      return NextResponse.json(
        { error: "Erro ao buscar indicadores financeiros" },
        { status: 500 }
      );
    }

    // ===============================
    // RETORNO FINAL
    // ===============================
    return NextResponse.json({
      status: "ok",
      indicadores: data,
    });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
