import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildBeneficios(nivel: number) {
  return {
    rebanho: true,
    pastagem: true,
    engorda: nivel >= 3,
    financeiro: nivel >= 3,
    cfo: nivel >= 5,
    esg: nivel >= 4,
    multiusuarios: nivel >= 4,
    suporte_vip: nivel >= 5,
  };
}

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const cookie = req.headers.get("cookie") ?? "";

    const supabase = createClient(url, anon, {
      global: { headers: { cookie } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      return NextResponse.json({ ativo: false }, { status: 200 });
    }

    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("plano_id, status")
      .eq("user_id", user.user.id)
      .eq("status", "ativa")
      .maybeSingle();

    if (!assinatura) {
      return NextResponse.json({ ativo: false }, { status: 200 });
    }

    return NextResponse.json({
      ativo: true,
      plano: "ultra",
      nivel: 3,
      beneficios: buildBeneficios(3),
      expires_at: null,
    });
  } catch {
    return NextResponse.json({ ativo: false }, { status: 200 });
  }
}
