// app/api/assinaturas/status/route.ts
// Fonte Y soberana — status de assinatura

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ativo: false, erro: "Token ausente" },
        { status: 401 }
      );
    }

    // 🔒 REGRA TEMPORÁRIA (OPÇÃO A – TESTE RÁPIDO)
    // enquanto Mercado Pago não governa
    return NextResponse.json({
      ativo: true,
      plano: "ultra",
      usuario: user.email,
    });
  } catch (e) {
    return NextResponse.json(
      { ativo: false, erro: "Erro interno" },
      { status: 500 }
    );
  }
}
