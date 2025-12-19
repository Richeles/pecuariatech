// app/api/planilhas/rebanho/route.ts
// Next.js 16 + TypeScript strict
// Exportação CSV do rebanho (controle por plano)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Planos autorizados para planilhas
const PLANOS_PERMITIDOS = ["profissional", "ultra", "dominus"];

export async function GET(req: Request) {
  try {
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

    // Usuário
    const { data } = await supabaseUser.auth.getUser(token);
    const user = data?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Usuário inválido" },
        { status: 401 }
      );
    }

    // -------------------------------
    // VERIFICAR PLANO ATIVO
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
        { error: "Plano não permite exportação" },
        { status: 403 }
      );
    }

    // -------------------------------
    // BUSCAR DADOS DO REBANHO
    // -------------------------------
    const { data: animais } = await supabaseAdmin
      .from("animais")
      .select(
        "id, nome, brinco, raca, sexo, peso, peso_inicial, ganho_medio_dia, custo_medio, status"
      );

    if (!animais || animais.length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado para exportar" },
        { status: 404 }
      );
    }

    // -------------------------------
    // GERAR CSV
    // -------------------------------
    const header = [
      "ID",
      "Nome",
      "Brinco",
      "Raça",
      "Sexo",
      "Peso Atual",
      "Peso Inicial",
      "Ganho Médio Dia",
      "Custo Médio",
      "Status",
    ];

    const rows = animais.map((a) => [
      a.id,
      a.nome ?? "",
      a.brinco ?? "",
      a.raca ?? "",
      a.sexo ?? "",
      a.peso ?? "",
      a.peso_inicial ?? "",
      a.ganho_medio_dia ?? "",
      a.custo_medio ?? "",
      a.status ?? "",
    ]);

    const csv = [
      header.join(";"),
      ...rows.map((r) => r.join(";")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="rebanho.csv"',
      },
    });
  } catch (err) {
    console.error("Erro exportação CSV:", err);
    return NextResponse.json(
      { error: "Erro ao exportar planilha" },
      { status: 500 }
    );
  }
}
