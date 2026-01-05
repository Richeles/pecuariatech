// CAMINHO: app/api/assinaturas/status/route.ts
// Fonte Y — Status de Assinatura
// Next.js 16 | Server Only

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { ativo: false, erro: "Token ausente" },
      { status: 401 }
    );
  }

  const supabaseAuth = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data: userData, error: userError } =
    await supabaseAuth.auth.getUser(token);

  if (userError || !userData?.user) {
    return NextResponse.json(
      { ativo: false, erro: "Usuário inválido" },
      { status: 401 }
    );
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("status, plano")
    .eq("user_id", userData.user.id)
    .single();

  if (!assinatura || assinatura.status !== "ativa") {
    return NextResponse.json({ ativo: false });
  }

  return NextResponse.json({
    ativo: true,
    plano: assinatura.plano,
  });
}
