// app/api/planos/precos/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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
