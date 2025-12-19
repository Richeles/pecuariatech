// app/api/planilhas/lote/[id]/route.ts
// Next.js 16 + TypeScript strict
// Exportação CSV por LOTE (controle por plano)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Planos que permitem exportação por lote
const PLANOS_PERMITIDOS = ["ultra", "dominus"];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const loteId = params.id;

    if (!loteId) {
      return NextResponse.json(
        { error: "ID do lote obrigatório" },
        { status: 400 }
      );
    }

    // -------------------------------
    // AUTENTICAÇÃO
    // -------------------------------
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

    // -------------------------------
    // VERIFICAR PLANO
    // -------------------------------
    const { data: assinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("plano_codigo")
      .eq("user_id", user.id)
      .eq("status", "ativo")
      .maybeSingle();

    const plano = assinatura?.plano_codigo ?? "trial";

    if (!PLANOS_PERMITIDOS.includes(plano)) {
      return NextResponse.json(
        { error: "Plano não permite exportação por lote" },
        { status: 403 }
      );
    }

    // -------------------------------
    // BUSCAR ANIMAIS DO LOTE
    // -------------------------------
    const { data: animais } = await supabaseAdmin
      .from("animais")
      .select(
        `
        id,
        nome,
        brinco,
        raca,
        sexo,
        categoria,
        peso,
        peso_inicial,
        ganho_medio_dia,
        custo_medio,
        status
      `
      )
      .eq("lote_id", loteId);

    if (!animais || animais.length === 0) {
      return NextResponse.json(
        { error: "Nenhum animal encontrado para este lote" },
        { status: 404 }
      );
    }

    // -------------------------------
    // MÉTRICAS DO LOTE
    // -------------------------------
    const totalAnimais = animais.length;

    const media = (campo: keyof typeof animais[0]) =>
      (
        animais.reduce(
          (s, a) => s + Number(a[campo] || 0),
          0
        ) / totalAnimais
      ).toFixed(2);

    const pesoMedio = media("peso");
    const ganhoMedioDia = media("ganho_medio_dia");
    const custoMedio = media("custo_medio");

    // -------------------------------
    // GERAR CSV
    // -------------------------------
    const headerResumo = [
      "Resumo do Lote",
      `Lote ID;${loteId}`,
      `Total de Animais;${totalAnimais}`,
      `Peso Médio;${pesoMedio}`,
      `Ganho Médio Diário;${ganhoMedioDia}`,
      `Custo Médio;${custoMedio}`,
      "",
    ];

    const headerDados = [
      "ID",
      "Nome",
      "Brinco",
      "Raça",
      "Sexo",
      "Categoria",
      "Peso",
      "Peso Inicial",
      "Ganho Médio Dia",
      "Custo Médio",
      "Status",
    ].join(";");

    const rows = animais.map((a) =>
      [
        a.id,
        a.nome ?? "",
        a.brinco ?? "",
        a.raca ?? "",
        a.sexo ?? "",
        a.categoria ?? "",
        a.peso ?? "",
        a.peso_inicial ?? "",
        a.ganho_medio_dia ?? "",
        a.custo_medio ?? "",
        a.status ?? "",
      ].join(";")
    );

    const csv = [
      ...headerResumo,
      headerDados,
      ...rows,
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lote_${loteId}.csv"`,
      },
    });
  } catch (err) {
    console.error("Erro exportação lote:", err);
    return NextResponse.json(
      { error: "Erro ao exportar planilha do lote" },
      { status: 500 }
    );
  }
}
