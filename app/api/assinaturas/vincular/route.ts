// app/api/assinaturas/vincular/route.ts
// Next.js 16 + TypeScript strict

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// ======================================================
// POST /api/assinaturas/vincular
// ======================================================
export async function POST(req: Request) {
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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🔐 Validar usuário
    const { data: userData } =
      await supabaseUser.auth.getUser(token);

    const user = userData?.user;

    if (!user) {
      return NextResponse.json(
        { error: "Usuário inválido" },
        { status: 401 }
      );
    }

    // 🔍 Buscar assinatura ativa ainda não vinculada
    const { data: assinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("*")
      .eq("status", "ativo")
      .is("user_id", null)
      .order("criado_em", { ascending: false })
      .limit(1)
      .single();

    if (!assinatura) {
      return NextResponse.json({
        vinculada: false,
      });
    }

    // 🔗 Vincular assinatura ao usuário
    await supabaseAdmin
      .from("assinaturas")
      .update({ user_id: user.id })
      .eq("id", assinatura.id);

    return NextResponse.json({
      vinculada: true,
      plano: assinatura.plano_codigo,
    });
  } catch (err) {
    console.error("Erro ao vincular assinatura:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
