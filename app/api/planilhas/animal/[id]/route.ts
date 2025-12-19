// app/api/planilhas/animal/[id]/route.ts
// Next.js 16 + TypeScript strict
// Exportação CSV por ANIMAL (controle por plano)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Planos que permitem exportação por animal
const PLANOS_PERMITIDOS = ["ultra", "dominus"];

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
        { error: "Plano não permite exportação por animal" },
        { status: 403 }
      );
    }

    // -------------------------------
    // BUSCAR DADOS DO ANIMAL
    // -------------------------------
    const { data: animal } = await supabaseAdmin
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
        status,
        data_nascimento,
        criado_em
      `
      )
      .eq("id", animalId)
      .single();

    if (!animal) {
      return NextResponse.json(
        { error: "Animal não encontrado" },
        { status: 404 }
      );
    }

    // -------------------------------
    // GERAR CSV
    // -------------------------------
    const csv = [
      "Campo;Valor",
      `ID;${animal.id}`,
      `Nome;${animal.nome ?? ""}`,
      `Brinco;${animal.brinco ?? ""}`,
      `Raça;${animal.raca ?? ""}`,
      `Sexo;${animal.sexo ?? ""}`,
      `Categoria;${animal.categoria ?? ""}`,
      `Peso Atual;${animal.peso ?? ""}`,
      `Peso Inicial;${animal.peso_inicial ?? ""}`,
      `Ganho Médio Diário;${animal.ganho_medio_dia ?? ""}`,
      `Custo Médio;${animal.custo_medio ?? ""}`,
      `Status;${animal.status ?? ""}`,
      `Data Nascimento;${animal.data_nascimento ?? ""}`,
      `Criado Em;${animal.criado_em ?? ""}`,
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="animal_${animal.id}.csv"`,
      },
    });
  } catch (err) {
    console.error("Erro exportação animal:", err);
    return NextResponse.json(
      { error: "Erro ao exportar planilha do animal" },
      { status: 500 }
    );
  }
}
