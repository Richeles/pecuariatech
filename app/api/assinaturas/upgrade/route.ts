import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PRECOS: Record<string, number> = {
  starter: 189.97,
  pro: 389.97,
  master: 589.97,
  dominus: 989.97,
};

const ORDEM_PLANOS = ["starter", "pro", "master", "dominus"];

export async function POST(req: NextRequest) {
  try {
    const { user_id, novo_plano } = await req.json();

    if (!user_id || !novo_plano) {
      return NextResponse.json({ error: "user_id e novo_plano são obrigatórios" }, { status: 400 });
    }

    if (!PRECOS[novo_plano]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    console.log(`[Upgrade] Solicitado upgrade para user ${user_id} → ${novo_plano}`);

    const { data: assinatura, error: errAssinatura } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "ativo")
      .maybeSingle();

    if (errAssinatura || !assinatura) {
      console.error("[Upgrade] Assinatura ativa não encontrada:", errAssinatura);
      return NextResponse.json({ error: "Assinatura ativa não encontrada" }, { status: 404 });
    }

    const planoAtual = assinatura.plano;
    const indiceAtual = ORDEM_PLANOS.indexOf(planoAtual);
    const indiceNovo = ORDEM_PLANOS.indexOf(novo_plano);

    if (indiceNovo <= indiceAtual) {
      return NextResponse.json({ error: "O plano selecionado não é superior ao atual" }, { status: 400 });
    }

    const hoje = new Date();
    const dataFim = new Date(assinatura.data_fim);
    const diasRestantes = Math.max(0, Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));

    if (diasRestantes <= 0) {
      return NextResponse.json({ error: "Assinatura expirada. Renove antes de fazer upgrade." }, { status: 400 });
    }

    const valorMensalAtual = PRECOS[planoAtual] || 0;
    const valorDiarioAtual = valorMensalAtual / 30;
    const credito = valorDiarioAtual * diasRestantes;

    const valorMensalNovo = PRECOS[novo_plano] || 0;
    const valorDiarioNovo = valorMensalNovo / 30;
    const valorProporcionalNovo = valorDiarioNovo * diasRestantes;
    const totalPagar = Math.max(0, valorProporcionalNovo - credito);

    console.log(`[Upgrade] Dias: ${diasRestantes}, Crédito: ${credito}, Total: ${totalPagar}`);

    const novaDataFim = new Date(hoje);
    novaDataFim.setDate(novaDataFim.getDate() + diasRestantes);

    const { error: errUpdate } = await supabase
      .from("assinaturas")
      .update({
        plano: novo_plano,
        valor_pago: valorMensalNovo,
        data_fim: novaDataFim.toISOString().split("T")[0],
        atualizado_em: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .eq("status", "ativo");

    if (errUpdate) {
      console.error("[Upgrade] Erro ao atualizar assinatura:", errUpdate);
      return NextResponse.json({ error: "Erro ao atualizar assinatura." }, { status: 500 });
    }

    await supabase.from("historico_assinaturas").insert({
      user_id,
      plano_antigo: planoAtual,
      plano_novo: novo_plano,
      valor_pago: valorMensalNovo,
      credito_utilizado: credito,
    });

    return NextResponse.json({
      success: true,
      plano_anterior: planoAtual,
      novo_plano,
      dias_restantes: diasRestantes,
      credito: credito,
      valor_novo_proporcional: valorProporcionalNovo,
      total_pagar: totalPagar,
      data_fim: novaDataFim.toISOString().split("T")[0],
    });
  } catch (error: any) {
    console.error("[Upgrade] Erro inesperado:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}