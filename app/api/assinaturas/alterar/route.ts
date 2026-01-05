// CAMINHO: app/api/assinaturas/alterar/route.ts
// Alteração de Plano — Upgrade / Downgrade
// Next.js 16 + TypeScript strict
// Backend soberano (Equação Y)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ================================
// ORDEM DE PLANOS (REGRA DE NEGÓCIO)
// ================================
const ORDEM_PLANOS = [
  "basico",
  "profissional",
  "ultra",
  "empresarial",
  "premium_dominus",
];

export async function POST(req: NextRequest) {
  try {
    // ================================
    // AUTH
    // ================================
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { erro: "Não autenticado" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const { novo_plano } = await req.json();

    if (!ORDEM_PLANOS.includes(novo_plano)) {
      return NextResponse.json(
        { erro: "Plano inválido" },
        { status: 400 }
      );
    }

    // ================================
    // SUPABASE (SERVER ONLY)
    // ================================
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: auth } =
      await supabase.auth.getUser(token);

    if (!auth?.user) {
      return NextResponse.json(
        { erro: "Sessão inválida" },
        { status: 401 }
      );
    }

    const user_id = auth.user.id;

    // ================================
    // ASSINATURA ATUAL
    // ================================
    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (!assinatura || !assinatura.ativo) {
      return NextResponse.json(
        { erro: "Nenhuma assinatura ativa" },
        { status: 400 }
      );
    }

    const planoAtual = assinatura.plano;

    if (planoAtual === novo_plano) {
      return NextResponse.json(
        { erro: "Plano já ativo" },
        { status: 400 }
      );
    }

    const idxAtual = ORDEM_PLANOS.indexOf(planoAtual);
    const idxNovo = ORDEM_PLANOS.indexOf(novo_plano);

    // ================================
    // 🔼 UPGRADE — IMEDIATO
    // ================================
    if (idxNovo > idxAtual) {
      await supabase
        .from("assinaturas")
        .update({
          plano: novo_plano,
          proximo_plano: null,
          troca_agendada: false,
        })
        .eq("user_id", user_id);

      await supabase.from("logs_financeiros").insert({
        user_id,
        tipo: "UPGRADE",
        plano_origem: planoAtual,
        plano_destino: novo_plano,
      });

      return NextResponse.json({
        sucesso: true,
        tipo: "upgrade",
      });
    }

    // ================================
    // 🔽 DOWNGRADE — AGENDADO
    // ================================
    if (idxNovo < idxAtual) {
      await supabase
        .from("assinaturas")
        .update({
          proximo_plano: novo_plano,
          troca_agendada: true,
        })
        .eq("user_id", user_id);

      await supabase.from("logs_financeiros").insert({
        user_id,
        tipo: "DOWNGRADE_AGENDADO",
        plano_origem: planoAtual,
        plano_destino: novo_plano,
      });

      return NextResponse.json({
        sucesso: true,
        tipo: "downgrade_agendado",
      });
    }

    return NextResponse.json({
      erro: "Operação inválida",
    });
  } catch (err) {
    console.error("Erro alterar plano:", err);
    return NextResponse.json(
      { erro: "Erro interno ao alterar plano" },
      { status: 500 }
    );
  }
}
