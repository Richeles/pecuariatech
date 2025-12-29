// app/api/assinaturas/vincular/route.ts
// Runtime-only | Mock de ativação | Equação Y

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { plano } = await req.json();

    if (!plano) {
      return NextResponse.json(
        { error: "Plano obrigatório" },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ success: true });

    /**
     * Cookie temporário
     * Depois será substituído por vínculo user_id + Supabase
     */
    res.cookies.set("plano_ativo", plano, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return res;
  } catch (err) {
    console.error("Erro vincular plano:", err);
    return NextResponse.json(
      { error: "Erro interno vincular" },
      { status: 500 }
    );
  }
}
