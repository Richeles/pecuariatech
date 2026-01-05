// CAMINHO: app/api/assinaturas/me/route.ts
// Painel de Assinatura — Fonte Y
// Next.js 16 + TypeScript strict

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("SUPABASE_URL não configurado");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
}

export async function GET(req: NextRequest) {
  try {
    const token =
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Validar usuário
    const { data: auth, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !auth?.user) {
      return NextResponse.json(
        { error: "Sessão inválida" },
        { status: 401 }
      );
    }

    const user_id = auth.user.id;

    // Buscar assinatura ativa (ou última)
    const { data, error } = await supabase
      .from("assinaturas")
      .select(
        `
        plano,
        periodo,
        status,
        origem,
        inicio,
        fim
      `
      )
      .eq("user_id", user_id)
      .order("inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        possui_assinatura: false,
      });
    }

    return NextResponse.json({
      possui_assinatura: true,
      ...data,
    });
  } catch (err) {
    console.error("Erro painel assinatura:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
