// CAMINHO: app/api/assinaturas/status/route.ts
// Status da Assinatura + Trial — Fonte Y
// Next.js 16 + TypeScript strict

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ================================
// CONFIGURAÇÃO DE TRIAL
// ================================
const TRIAL_DIAS = 7;

// ================================
// GET /api/assinaturas/status
// ================================
export async function GET(req: NextRequest) {
  try {
    // ================================
    // VALIDAR VARIÁVEIS (SERVER ONLY)
    // ================================
    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error("Variáveis Supabase não configuradas");
    }

    // ================================
    // TOKEN (OBRIGATÓRIO PARA STATUS REAL)
    // ================================
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({
        plano: "nenhum",
        ativo: false,
        trial: false,
      });
    }

    // ================================
    // SUPABASE ADMIN (RUNTIME ONLY)
    // ================================
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ================================
    // VALIDAR USUÁRIO PELO TOKEN
    // ================================
    const { data: auth } =
      await supabase.auth.getUser(token);

    if (!auth?.user) {
      return NextResponse.json({
        plano: "nenhum",
        ativo: false,
        trial: false,
      });
    }

    const user = auth.user;

    // ================================
    // 1) VERIFICAR ASSINATURA ATIVA
    // ================================
    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("plano, ativo")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .single();

    if (assinatura?.ativo) {
      return NextResponse.json({
        plano: assinatura.plano,
        ativo: true,
        trial: false,
      });
    }

    // ================================
    // 2) CALCULAR TRIAL
    // ================================
    const criadoEm = new Date(user.created_at);
    const agora = new Date();

    const trialExpiraEm = new Date(criadoEm);
    trialExpiraEm.setDate(
      trialExpiraEm.getDate() + TRIAL_DIAS
    );

    const trialAtivo = agora <= trialExpiraEm;

    if (trialAtivo) {
      return NextResponse.json({
        plano: "trial",
        ativo: true,
        trial: true,
        trial_expira_em: trialExpiraEm.toISOString(),
      });
    }

    // ================================
    // 3) SEM DIREITO
    // ================================
    return NextResponse.json({
      plano: "nenhum",
      ativo: false,
      trial: false,
    });
  } catch (err) {
    console.error("Erro status assinatura:", err);

    return NextResponse.json({
      plano: "nenhum",
      ativo: false,
      trial: false,
    });
  }
}
