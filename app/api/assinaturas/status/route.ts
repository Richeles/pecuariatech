// app/api/assinaturas/status/route.ts
// Next.js 16 + TypeScript strict

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { ativo: false },
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

    // 🔐 Validar usuário
    const { data } = await supabaseUser.auth.getUser(token);
    const user = data?.user;

    if (!user) {
      return NextResponse.json({ ativo: false });
    }

    // 🔎 Verificar assinatura ativa
    const { data: assinatura } = await supabaseAdmin
      .from("assinaturas")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "ativo")
      .maybeSingle();

    return NextResponse.json({
      ativo: !!assinatura,
    });
  } catch (err) {
    console.error("Erro status assinatura:", err);
    return NextResponse.json(
      { ativo: false },
      { status: 500 }
    );
  }
}
