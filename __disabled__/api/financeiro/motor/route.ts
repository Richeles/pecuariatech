// app/api/financeiro/motor/route.ts
// Next.js 16 + TypeScript strict
// C3.5.4 — Motor Financeiro Harvan (EBITDA + ROI)
// Runtime-only | Equação Y aplicada CORRETAMENTE

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔒 GARANTE QUE NUNCA RODA NO BUILD
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Autorização
    const auth = req.headers.get("authorization");
    const token = auth?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // 2️⃣ Supabase ADMIN — SOMENTE EM RUNTIME
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
      }
    );

    // 3️⃣ Valida usuário pelo token
    const { data: userData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Usuário inválido" },
        { status: 401 }
      );
    }

    const user = userData.user;

    // 4️⃣ KPIs Financeiros (VIEW)
    const { data, error } = await supabase
      .from("kpis_financeiros_harvan")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erro KPIs Financeiros:", error);
      return NextResponse.json(
        { error: "KPIs não disponíveis" },
        { status: 404 }
      );
    }

    // 5️⃣ Cálculos seguros
    const receita = data?.receita_total ?? 0;
    const custos = data?.custo_total ?? 0;
    const capital = data?.capital_investido ?? 0;
    const ebitda = data?.ebitda_agro ?? 0;

    const roi =
      capital > 0 ? Number((ebitda / capital).toFixed(4)) : null;

    // 6️⃣ Resposta final
    return NextResponse.json({
      receita_total: receita,
      custo_total: custos,
      ebitda_agro: ebitda,
      capital_investido: capital,
      roi,
    });
  } catch (error) {
    console.error("Erro Motor Financeiro:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
