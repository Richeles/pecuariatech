// app/api/assinaturas/trocar-plano/route.ts
// Upgrade / Downgrade de plano — backend real

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { novo_plano_nome } = await req.json();

    if (!novo_plano_nome) {
      return NextResponse.json(
        { error: "Plano não informado" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: auth } = await supabase.auth.getUser(token);
    if (!auth?.user) {
      return NextResponse.json(
        { error: "Sessão inválida" },
        { status: 401 }
      );
    }

    const user_id = auth.user.id;

    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("id, plano_id, renovacao_em")
      .eq("user_id", user_id)
      .eq("status", "ativo")
      .single();

    if (!assinatura) {
      return NextResponse.json(
        { error: "Assinatura ativa não encontrada" },
        { status: 404 }
      );
    }

    const { data: planoAtual } = await supabase
      .from("planos_legacy")
      .select("id, nivel")
      .eq("id", assinatura.plano_id)
      .single();

    const { data: novoPlano } = await supabase
      .from("planos_legacy")
      .select("id, nivel")
      .eq("nome", novo_plano_nome)
      .single();

    if (!novoPlano) {
      return NextResponse.json(
        { error: "Plano inválido" },
        { status: 400 }
      );
    }

    if (novoPlano.id === planoAtual.id) {
      return NextResponse.json(
        { error: "Plano já ativo" },
        { status: 400 }
      );
    }

    // 🔺 UPGRADE
    if (novoPlano.nivel > planoAtual.nivel) {
      await supabase
        .from("assinaturas")
        .update({
          plano_id: novoPlano.id,
          proximo_plano_id: null,
          troca_agendada_em: null,
        })
        .eq("id", assinatura.id);

      return NextResponse.json({
        tipo: "upgrade",
        aplicado: true,
      });
    }

    // 🔻 DOWNGRADE (agendado)
    await supabase
      .from("assinaturas")
      .update({
        proximo_plano_id: novoPlano.id,
        troca_agendada_em: assinatura.renovacao_em,
      })
      .eq("id", assinatura.id);

    return NextResponse.json({
      tipo: "downgrade",
      aplicado: false,
      efetivo_em: assinatura.renovacao_em,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
