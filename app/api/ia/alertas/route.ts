// app/api/ia/alertas/route.ts
// IA UltraBiológica - Alertas Agroclimáticos Autônomos

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ===============================
// PLANOS QUE RECEBEM ALERTAS
// ===============================
const PLANOS_ALERTAS = ["profissional", "ultra", "empresarial", "dominus"];

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userData } = await supabaseUser.auth.getUser(token);
    const user = userData?.user;

    if (!user) {
      return NextResponse.json({ error: "Usuário inválido" }, { status: 401 });
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

    if (!PLANOS_ALERTAS.includes(plano)) {
      return NextResponse.json(
        { error: "Plano não permite alertas inteligentes" },
        { status: 403 }
      );
    }

    // ===============================
    // GPS DA FAZENDA (SIMPLIFICADO)
    // ===============================
    const { data: fazenda } = await supabaseAdmin
      .from("fazendas")
      .select("gps_lat, gps_lng")
      .eq("user_id", user.id)
      .maybeSingle();

    const lat = fazenda?.gps_lat ?? -15;
    const lng = fazenda?.gps_lng ?? -55;

    // ===============================
    // CLIMA (HEURÍSTICO - BASE ATUAL)
    // Depois entra API real
    // ===============================
    const mes = new Date().getMonth() + 1;

    const clima =
      mes >= 10 || mes <= 3
        ? "chuvoso"
        : mes >= 5 && mes <= 8
        ? "seco"
        : "transicao";

    // Fenômeno macro (heurístico)
    const fenomeno =
      mes >= 11 || mes <= 2 ? "El Niño (tendência)" : "Neutro";

    // ===============================
    // SUGESTÃO DE PLANTIO
    // ===============================
    let sugestaoPlantio = "";

    if (clima === "chuvoso") {
      sugestaoPlantio =
        "Indicado reforço de pastagens de alto crescimento (ex: braquiária, mombaça). Atenção à lotação.";
    }

    if (clima === "seco") {
      sugestaoPlantio =
        "Planejar silagem, capineira e suplementação estratégica. Evitar sobrepastejo.";
    }

    if (clima === "transicao") {
      sugestaoPlantio =
        "Momento ideal para planejamento do próximo ciclo e correções de solo.";
    }

    // ===============================
    // ALERTA FINAL
    // ===============================
    return NextResponse.json({
      localizacao: { lat, lng },
      clima_atual: clima,
      fenomeno_global: fenomeno,
      alerta:
        clima === "seco"
          ? "Risco de estresse hídrico no rebanho."
          : null,
      recomendacao_agroclimatica: sugestaoPlantio,
      origem: "IA UltraBiológica",
    });
  } catch (err) {
    console.error("Erro alertas IA:", err);
    return NextResponse.json(
      { error: "Erro no motor de alertas" },
      { status: 500 }
    );
  }
}
