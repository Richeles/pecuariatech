// CAMINHO: app/api/cfo/ultra/monitorar/route.ts
// Next.js 16 + TypeScript strict
// Orquestrador CFO Ultra → Alertas + Histórico
// Equação Y preservada

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // =====================================
    // BASE URL
    // =====================================
    const baseUrl = new URL(request.url).origin;

    // =====================================
    // SUPABASE (SERVER-ONLY)
    // =====================================
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // =====================================
    // 1️⃣ CFO ULTRA (DECISÃO)
    // =====================================
    const avaliarRes = await fetch(
      `${baseUrl}/api/cfo/ultra/avaliar`,
      { cache: "no-store" }
    );

    if (!avaliarRes.ok) {
      throw new Error("Falha ao consultar CFO Ultra");
    }

    const avaliacao = await avaliarRes.json();
    const dados = avaliacao.avaliacao;

    if (!dados?.nivel) {
      throw new Error("Resposta inválida do CFO Ultra");
    }

    // =====================================
    // 2️⃣ REGISTRAR HISTÓRICO (NÃO BLOQUEANTE)
    // =====================================
    await supabase.from("cfo_decisoes").insert({
      origem: "CFO Ultra",
      nivel: dados.nivel,
      resultado_operacional: dados.resultado_operacional,
      margem_percentual: dados.margem_percentual,
      mensagem: dados.mensagem,
    });

    // =====================================
    // 3️⃣ ALERTA SE CRÍTICO
    // =====================================
    if (dados.nivel === "critico") {
      const alertaRes = await fetch(
        `${baseUrl}/api/cfo/alertas/enviar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origem: "CFO Ultra",
            nivel: dados.nivel,
            mensagem: dados.mensagem,
            resultado_operacional: dados.resultado_operacional,
          }),
        }
      );

      if (!alertaRes.ok) {
        throw new Error("Falha ao enviar alerta CFO");
      }

      return NextResponse.json({
        status: "alerta_enviado",
        avaliacao: dados,
      });
    }

    // =====================================
    // 4️⃣ NÃO CRÍTICO
    // =====================================
    return NextResponse.json({
      status: "sem_alerta",
      avaliacao: dados,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        erro: "Erro no monitoramento CFO",
        detalhe: error.message,
      },
      { status: 500 }
    );
  }
}
