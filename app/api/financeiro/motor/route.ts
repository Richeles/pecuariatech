// app/api/financeiro/motor/route.ts
// Next.js 16 + TypeScript strict
// C3.5.4 — Motor Financeiro Harvan (EBITDA + ROI)
// Runtime-only | Equação Y aplicada

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;

    if (!user) {
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });
    }

    const { data } = await supabase
      .from("kpis_financeiros_harvan")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const receita = data?.receita_total ?? 0;
    const custos = data?.custo_total ?? 0;
    const capital = data?.capital_investido ?? 0;
    const ebitda = data?.ebitda_agro ?? 0;

    const roi =
      capital > 0 ? Number((ebitda / capital).toFixed(4)) : null;

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
