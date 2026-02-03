import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

/* ============================
   FULL ACCESS (MASTER)
============================ */

const FULL_ACCESS = {
  rebanho: true,
  pastagem: true,
  engorda_base: true,
  engorda_ultra: true,
  financeiro: true,
  cfo: true,
  esg: true,
  multiusuario: true,
};

/* ============================
   HANDLER
============================ */

export async function GET() {
  console.log("🔥 /api/assinaturas/status EXECUTANDO");

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  /* ============================
     1) USER SESSION
  ============================ */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      ativo: false,
      reason: "no_session",
    });
  }

  console.log("👤 USER:", user.id, user.email);

  /* ============================
     2) ADMIN MASTER OVERRIDE
  ============================ */

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id, role, ativo")
    .eq("user_id", user.id)
    .eq("role", "master")
    .eq("ativo", true)
    .maybeSingle();

  console.log("🛂 ADMIN:", admin, adminError);

  if (admin) {
    return NextResponse.json({
      ativo: true,
      plano: "master",
      nivel: 999,
      expires_at: null,
      beneficios: FULL_ACCESS,
      reason: "admin_override",
    });
  }

  /* ============================
     3) ASSINATURA NORMAL
  ============================ */

  const { data: assinatura, error: assinaturaError } = await supabase
    .from("assinatura_ativa_view")
    .select("plano_nome, plano_nivel")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("💳 ASSINATURA:", assinatura, assinaturaError);

  if (!assinatura) {
    return NextResponse.json({
      ativo: false,
      plano: "basico",
      nivel: 1,
      expires_at: null,
      beneficios: {
        rebanho: true,
        pastagem: true,
        engorda_base: false,
        engorda_ultra: false,
        financeiro: false,
        cfo: false,
        esg: false,
        multiusuario: false,
      },
      reason: "no_subscription",
    });
  }

  /* ============================
     4) ASSINANTE ATIVO
  ============================ */

  return NextResponse.json({
    ativo: true,
    plano: assinatura.plano_nome,
    nivel: assinatura.plano_nivel,
    expires_at: null,
    beneficios: {
      rebanho: true,
      pastagem: true,
      engorda_base: true,
      engorda_ultra: true,
      financeiro: true,
      cfo: true,
      esg: true,
      multiusuario: false,
    },
    reason: "ok",
  });
}
