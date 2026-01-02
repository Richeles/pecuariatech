// app/api/planos/precos/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
    // ✅ SUPABASE CRIADO EM RUNTIME (NUNCA NO TOPO)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("planos_precos")
      .select(`
        preco_base,
        preco_atual,
        ano_base,
        planos (
          codigo,
          nome_exibicao,
          nivel_ordem
        )
      `)
      .eq("ativo", true)
      .order("planos(nivel_ordem)", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const planos = data.map((item: any) => ({
      codigo: item.planos.codigo,
      nome: item.planos.nome_exibicao,
      nivel: item.planos.nivel_ordem,
      preco_base: item.preco_base,
      preco_atual: item.preco_atual,
      ano_base: item.ano_base,
    }));

    return NextResponse.json(planos, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno ao carregar preços" },
      { status: 500 }
    );
  }
}
