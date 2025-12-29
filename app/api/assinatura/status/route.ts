// app/api/assinatura/status/route.ts
// Fonte Y — Assinatura REAL

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization");

  if (!auth) {
    return NextResponse.json({ status: "sem_auth" }, { status: 401 });
  }

  const token = auth.replace("Bearer ", "");

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ status: "usuario_invalido" }, { status: 401 });
  }

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("status, plano, expira_em")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!assinatura) {
    return NextResponse.json({ status: "sem_assinatura" }, { status: 200 });
  }

  if (
    assinatura.status !== "ativa" ||
    (assinatura.expira_em &&
      new Date(assinatura.expira_em) < new Date())
  ) {
    return NextResponse.json({ status: "expirada" }, { status: 200 });
  }

  return NextResponse.json({
    status: "ativa",
    plano: assinatura.plano,
    expira_em: assinatura.expira_em,
  });
}
