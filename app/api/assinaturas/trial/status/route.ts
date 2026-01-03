// CAMINHO: app/api/assinaturas/trial/status/route.ts
// Next.js 16 + TypeScript strict
// Leitura de Trial — Fonte Y do Paywall

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ ativo: false });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = authHeader.replace("Bearer ", "");

  const { data: userData, error } = await supabase.auth.getUser(token);

  if (error || !userData.user) {
    return NextResponse.json({ ativo: false });
  }

  const { data: trial } = await supabase
    .from("assinaturas_trial")
    .select("expires_at")
    .eq("user_id", userData.user.id)
    .eq("status", "ativo")
    .maybeSingle();

  if (!trial) {
    return NextResponse.json({ ativo: false });
  }

  const agora = new Date();
  const expira = new Date(trial.expires_at);

  const ativo = expira > agora;
  const dias_restantes = Math.ceil(
    (expira.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)
  );

  return NextResponse.json({
    ativo,
    expires_at: trial.expires_at,
    dias_restantes,
  });
}
