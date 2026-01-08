// CAMINHO: app/api/financeiro/indicadores-avancados/route.ts
// PecuariaTech Autônomo — Motor Financeiro Seguro
// Fonte Y | Server only | Anti-500

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    // ===============================
    // 1️⃣ TOKEN DO HEADER
    // ===============================
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token ausente" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // ===============================
    // 2️⃣ SUPABASE SERVER (SEM GLOBAL)
    // ===============================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ===============================
    // 3️⃣ VALIDAR USUÁRIO PELO TOKEN
    // ===============================
    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "Sessão inválida" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // ===============================
    // 4️⃣ CONSULTA FINANCEIRA (SAFE)
    // ===============================
    const { data, error } = await supabase
      .from("financeiro_lancamentos")
      .select("valor, tipo")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    // ===============================
    // 5️⃣ CÁLCULO SEGURO (ZERO-FALLBACK)
    // ===============================
    let receita = 0;
    let custo = 0;

    for (const item of data ?? []) {
      if (item.tipo === "receita") receita += item.valor;
      if (item.tipo === "custo") custo += item.valor;
    }

    const resultado = receita - custo;
    const margem =
      receita > 0 ? ((resultado / receita) * 100).toFixed(2) : "0.00";

    // ===============================
    // 6️⃣ RESPOSTA PADRÃO (NUNCA QUEBRA)
    // ===============================
    return NextResponse.json({
      indicadores: {
        receita_total: receita,
        custo_total: custo,
        resultado_operacional: resultado,
        margem_percentual: Number(margem),
      },
    });
  } catch (err) {
    console.error("Erro financeiro:", err);

    return NextResponse.json(
      {
        indicadores: {
          receita_total: 0,
          custo_total: 0,
          resultado_operacional: 0,
          margem_percentual: 0,
        },
      },
      { status: 200 } // ⚠️ Nunca quebrar o dashboard
    );
  }
}
