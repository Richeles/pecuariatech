// CAMINHO: app/api/assinaturas/trial/route.ts
// Next.js 16 + TypeScript strict
// Trial isolado — Equação Y preservada

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ erro: "Token ausente" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = authHeader.replace("Bearer ", "");

  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ erro: "Usuário inválido" }, { status: 401 });
  }

  const userId = userData.user.id;

  const { data: existente } = await supabase
    .from("assinaturas_trial")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "ativo")
    .maybeSingle();

  if (existente) {
    return NextResponse.json(
      { erro: "Trial já ativo" },
      { status: 400 }
    );
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error: insertError } = await supabase
    .from("assinaturas_trial")
    .insert({
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      status: "ativo",
    });

  if (insertError) {
    return NextResponse.json(
      { erro: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    sucesso: true,
    expires_at: expiresAt,
  });
}
