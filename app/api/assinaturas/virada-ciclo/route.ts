// CAMINHO: app/api/assinaturas/virada-ciclo/route.ts
// Rotina de Virada de Ciclo — Aplicar Downgrades Agendados
// Next.js 16 + TypeScript strict
// Backend soberano (Equação Y)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    // ================================
    // CLIENTE SUPABASE (SERVER ONLY)
    // ================================
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error("Variáveis Supabase não configuradas");
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ================================
    // 1) BUSCAR ASSINATURAS COM DOWNGRADE
    // ================================
    const { data: assinaturas, error } = await supabase
      .from("assinaturas")
      .select("id, user_id, plano, proximo_plano")
      .eq("ativo", true)
      .eq("troca_agendada", true)
      .not("proximo_plano", "is", null);

    if (error) throw error;

    if (!assinaturas || assinaturas.length === 0) {
      return NextResponse.json({
        ok: true,
        processadas: 0,
        mensagem: "Nenhum downgrade pendente",
      });
    }

    let processadas = 0;

    // ================================
    // 2) APLICAR DOWNGRADE + LOG
    // ================================
    for (const assinatura of assinaturas) {
      const { id, user_id, plano, proximo_plano } = assinatura;

      // Atualiza assinatura (por ID)
      const { error: updateError } = await supabase
        .from("assinaturas")
        .update({
          plano: proximo_plano,
          proximo_plano: null,
          troca_agendada: false,
        })
        .eq("id", id);

      if (updateError) {
        console.error(
          `Erro ao atualizar assinatura ${id}:`,
          updateError
        );
        continue;
      }

      // Log financeiro
      const { error: logError } = await supabase
        .from("logs_financeiros")
        .insert({
          user_id,
          evento: "DOWNGRADE_APLICADO",
          plano_origem: plano,
          plano_destino: proximo_plano,
          origem: "sistema",
          created_at: new Date().toISOString(),
        });

      if (logError) {
        console.error(
          `Erro ao logar downgrade da assinatura ${id}:`,
          logError
        );
      }

      processadas++;
    }

    return NextResponse.json({
      ok: true,
      processadas,
    });
  } catch (err: any) {
    console.error("Erro virada de ciclo:", err);

    return NextResponse.json(
      {
        ok: false,
        erro: "Erro na virada de ciclo",
        detalhe: err?.message ?? err,
      },
      { status: 500 }
    );
  }
}
