// Next.js 16 + TypeScript strict
// PecuariaTech Autônomo — CFO Decision Engine v1

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Token ausente" }, { status: 401 });
  }

  const token = auth.replace("Bearer ", "");
  const supabase = getSupabase(token);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const { data } = await supabase
    .from("financeiro_indicadores_view")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!data) {
    return NextResponse.json({
      status: "ok",
      decisao: "Sem dados suficientes para análise",
      prioridade: "baixa",
    });
  }

  let decisao = "Operação financeiramente estável";
  let prioridade: "baixa" | "media" | "alta" = "baixa";

  if (data.margem_percentual < 5) {
    decisao =
      "Margem crítica. Recomenda-se revisar custos operacionais e sanidade do rebanho.";
    prioridade = "alta";
  } else if (data.custo_total > data.receita_total * 0.8) {
    decisao =
      "Custo elevado em relação à receita. Avaliar renegociação de insumos.";
    prioridade = "media";
  }

  return NextResponse.json({
    status: "ok",
    decisao,
    prioridade,
    indicadores: {
      receita: data.receita_total,
      custo: data.custo_total,
      margem: data.margem_percentual,
    },
  });
}
