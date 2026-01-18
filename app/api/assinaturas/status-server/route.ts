// app/api/assinaturas/status-server/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { permissoesDoPlano, PlanoNivel } from "@/app/lib/planos/permissoes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAtiva(status: any): boolean {
  const v = String(status ?? "").toLowerCase().trim();
  return v === "ativa" || v === "active" || v.includes("ativa");
}

// ⚠️ Fallback seguro enquanto não houver mapa UUID → plano
function planoFromPlanoId(_planoId: any): PlanoNivel {
  return "basico";
}

function planoToNivel(plano: PlanoNivel): number {
  switch (plano) {
    case "profissional": return 2;
    case "ultra": return 3;
    case "empresarial": return 4;
    case "premium_dominus": return 5;
    default: return 1;
  }
}

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json({ error: "Env Supabase ausente" }, { status: 500 });
    }

    const cookie = req.headers.get("cookie") ?? "";
    const supabase = createClient(url, anon, {
      global: { headers: { cookie } },
      auth: { persistSession: false },
    });

    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json({
        ativo: false,
        plano: "basico",
        nivel: 1,
        expires_at: null,
        beneficios: permissoesDoPlano("basico"),
      });
    }

    const { data: rows } = await supabase
      .from("assinaturas")
      .select("plano_id,status,renovacao_em,fim_trial")
      .eq("user_id", userData.user.id)
      .order("criado_em", { ascending: false })
      .limit(1);

    const active = rows?.find(r => isAtiva(r.status));
    if (!active) {
      return NextResponse.json({
        ativo: false,
        plano: "basico",
        nivel: 1,
        expires_at: null,
        beneficios: permissoesDoPlano("basico"),
      });
    }

    const plano = planoFromPlanoId(active.plano_id);
    return NextResponse.json({
      ativo: true,
      plano,
      nivel: planoToNivel(plano),
      expires_at: active.renovacao_em ?? active.fim_trial ?? null,
      beneficios: permissoesDoPlano(plano),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
