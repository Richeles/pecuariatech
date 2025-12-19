// app/api/ia/animal/[id]/route.ts
// Next.js 16 + TypeScript strict
// IA UltraBiológica Autônoma — Microdiagnóstico por Animal
// Orientação Veterinária & Zootécnica

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Planos com acesso à IA individual
const PLANOS_PERMITIDOS = ["ultra", "dominus"];

// Parâmetros técnicos (futuro: configurável)
const PARAMETROS = {
  ganhoEsperadoKgDia: 0.75,
  limiteAtencao: 0.85,
  limiteCritico: 0.65,
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const animalId = params.id;

    if (!animalId) {
      return NextResponse.json(
        { error: "ID do animal obrigatório" },
        { status: 400 }
      );
    }

    // ===============================
    // AUTENTICAÇÃO
    // ===============================
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabaseUser.auth.getUser(token);
    const user = data?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Usuário inválido" },
        { status: 401 }
      );
    }

    // ===============================
    // VERIFICAR PLANO
    // ===============================
    const { data: assinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("plano_codigo")
      .eq("user_id", user.id)
      .eq("status", "ativo")
      .maybeSingle();

    const plano = assinatura?.plano_codigo ?? "trial";

    if (!PLANOS_PERMITIDOS.includes(plano)) {
      return NextResponse.json(
        { error: "Plano não permite IA por animal" },
        { status: 403 }
      );
    }

    // ===============================
    // BUSCAR DADOS DO ANIMAL
    // ===============================
    const { data: animal } = await supabaseAdmin
      .from("animais")
      .select(`
        id,
        nome,
        raca,
        sexo,
        categoria,
        peso,
        peso_inicial,
        ganho_medio_dia,
        custo_medio,
        status,
        data_nascimento,
        criado_em
      `)
      .eq("id", animalId)
      .single();

    if (!animal) {
      return NextResponse.json(
        { error: "Animal não encontrado" },
        { status: 404 }
      );
    }

    // ===============================
    // AVALIAÇÃO BIOLÓGICA INDIVIDUAL
    // ===============================
    const ganhoEsperado = PARAMETROS.ganhoEsperadoKgDia;
    const ganho = Number(animal.ganho_medio_dia || 0);
    const custo = Number(animal.custo_medio || 0);
    const peso = Number(animal.peso || 0);

    let status: "adequado" | "atencao" | "critico" = "adequado";
    let alerta: string | null = null;

    if (ganho < ganhoEsperado * PARAMETROS.limiteAtencao) {
      status = "atencao";
      alerta =
        "Ganho médio diário abaixo do esperado para o perfil produtivo do animal.";
    }

    if (ganho < ganhoEsperado * PARAMETROS.limiteCritico) {
      status = "critico";
      alerta =
        "Desempenho produtivo individual crítico, com risco sanitário e econômico.";
    }

    const eficiencia =
      custo > 0 ? ganho / custo : 0;

    // ===============================
    // SCORE ULTRABIOLÓGICO INDIVIDUAL
    // ===============================
    const score = Math.max(
      0,
      Math.min(
        100,
        Math.round((ganho / ganhoEsperado) * 100)
      )
    );

    // ===============================
    // LAUDO TÉCNICO PROFISSIONAL
    // ===============================
    const diagnostico = `
Laudo técnico individual do animal ${animal.nome ?? animal.id}.

Avaliação zootécnica:
O ganho médio diário observado foi de ${ganho.toFixed(
      2
    )} kg/dia, frente ao valor de referência de ${ganhoEsperado.toFixed(
      2
    )} kg/dia. O peso atual é de ${peso.toFixed(1)} kg.

Avaliação econômica:
O custo médio estimado é de R$ ${custo.toFixed(
      2
    )}, com eficiência produtiva de ${eficiencia.toFixed(
      3
    )} kg/R$.

Avaliação veterinária:
Desvios persistentes de desempenho individual podem estar associados a fatores
nutricionais, sanitários ou de adaptação ao ambiente.

Classificação técnica individual: ${status.toUpperCase()}.
`.trim();

    const recomendacao =
      status === "adequado"
        ? "Manter o manejo atual e monitorar periodicamente o desempenho individual."
        : status === "atencao"
        ? "Recomenda-se observar consumo, avaliar sanidade e revisar o manejo nutricional."
        : "Recomenda-se intervenção técnica imediata: avaliação clínica, ajuste nutricional e monitoramento intensivo.";

    return NextResponse.json({
      animal_id: animal.id,
      nome: animal.nome,
      status,
      alerta,
      score_ultrabiologico: score,
      indicadores: {
        peso,
        ganho_medio_dia: ganho,
        custo_medio: custo,
        eficiencia_kg_por_real: eficiencia,
      },
      diagnostico,
      recomendacao,
    });
  } catch (err) {
    console.error("Erro IA animal:", err);
    return NextResponse.json(
      { error: "Erro na análise UltraBiológica individual" },
      { status: 500 }
    );
  }
}
