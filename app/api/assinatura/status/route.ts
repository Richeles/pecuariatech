import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// =====================================================
// GET /api/assinatura/status
// Fonte única da verdade do PAYWALL
// =====================================================
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json(
      { status: "anonimo" },
      { status: 401 }
    );
  }

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("status, plano_codigo, fim_trial")
    .eq("user_id", userId)
    .maybeSingle();

  if (!assinatura) {
    return NextResponse.json({ status: "sem_plano" });
  }

  if (
    assinatura.status === "trial" &&
    assinatura.fim_trial &&
    new Date(assinatura.fim_trial) < new Date()
  ) {
    return NextResponse.json({ status: "trial_expirado" });
  }

  return NextResponse.json({
    status: assinatura.status,       // trial | ativa
    plano_codigo: assinatura.plano_codigo,
  });
}
