// app/api/assinaturas/status-server/route.ts
// SaaS por Plano — Status SERVER (cookie/session)
// Equação Y: Supabase (assinaturas) → API canônica server → middleware
//
// ✅ Regras:
// - NÃO usa Bearer token
// - usa cookies do request (sessão Supabase)
// - read-only
// - sempre retorna JSON estável

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePlano(raw: any): "basico" | "pro" | "premium" {
  const v = String(raw ?? "").toLowerCase().trim();
  if (!v) return "basico";
  if (v.includes("premium") || v === "3") return "premium";
  if (v.includes("ultra") || v.includes("prof") || v.includes("pro") || v === "2") return "pro";
  return "basico";
}

function planoToNivel(plano: "basico" | "pro" | "premium") {
  if (plano === "premium") return 3;
  if (plano === "pro") return 2;
  return 1;
}

function buildBeneficios(plano: "basico" | "pro" | "premium") {
  if (plano === "premium") {
    return { rebanho: true, pastagem: true, engorda: true, financeiro: true, cfo: true };
  }
  if (plano === "pro") {
    return { rebanho: true, pastagem: true, engorda: true, financeiro: true, cfo: false };
  }
  return { rebanho: true, pastagem: true, engorda: false, financeiro: false, cfo: false };
}

export async function GET(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json(
        { error: "Server misconfigured: missing Supabase env (URL/ANON)" },
        { status: 500 }
      );
    }

    // ✅ Client server-friendly: recebe cookies da requisição
    const cookieHeader = req.headers.get("cookie") ?? "";

    const supabase = createClient(url, anon, {
      global: {
        headers: {
          cookie: cookieHeader,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // ✅ Identifica usuário por sessão server-side
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return NextResponse.json(
        { ativo: false, plano: "basico", nivel: 1, expires_at: null, beneficios: buildBeneficios("basico") },
        { status: 200 }
      );
    }

    const userId = userData.user.id;

    // ✅ Consulta assinatura
    const { data: rows, error } = await supabase
      .from("assinaturas")
      .select("id,user_id,status,plano,plano_id,expires_at,updated_at,created_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: "Supabase query error", details: error.message },
        { status: 500 }
      );
    }

    const list = Array.isArray(rows) ? rows : [];
    const active = list.find((r: any) => String(r?.status ?? "").toLowerCase().includes("ativa"));

    if (!active) {
      return NextResponse.json(
        { ativo: false, plano: "basico", nivel: 1, expires_at: null, beneficios: buildBeneficios("basico") },
        { status: 200 }
      );
    }

    const plano = normalizePlano(active.plano ?? active.plano_id);
    const nivel = planoToNivel(plano);

    return NextResponse.json(
      {
        ativo: true,
        plano,
        nivel,
        expires_at: active.expires_at ?? null,
        beneficios: buildBeneficios(plano),
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
