import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/* ============================
   UTILS
============================ */

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`ENV ausente: ${name}`);
  }
  return value;
}

async function hasSupabaseCookie(): Promise<boolean> {
  const store = await cookies();
  return store.getAll().some((c) => c.name.includes("sb-"));
}

function supabaseServerReadOnly() {
  // ✅ CORREÇÃO AQUI
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normStatus(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

/* ============================
   HANDLER
============================ */

export async function GET(req: Request) {
  try {
    console.log("🌱 /api/pastagem/status EXECUTANDO");

    if (!(await hasSupabaseCookie())) {
      return NextResponse.json(
        { ok: false, reason: "no_session_cookie" },
        { status: 401 }
      );
    }

    const sb = supabaseServerReadOnly();

    /* ============================
       EXECUTIVO (VIEW)
    ============================ */

    const { data: resumo, error: resumoErr } = await sb
      .from("pastagem_status_view")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (resumoErr) {
      console.log("❌ ERRO RESUMO:", resumoErr);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    /* ============================
       OPERACIONAL
    ============================ */

    const { data: piquetesData, error: piquetesErr } = await sb
      .from("piquete_status_view")
      .select("*");

    if (piquetesErr) {
      console.log("❌ ERRO PIQUETES:", piquetesErr);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const piquetes = piquetesData ?? [];

    const total_piquetes = piquetes.length;

    const ocupados = piquetes.filter((p) =>
      normStatus(p.status).includes("ocupado")
    ).length;

    const area_total_ha = piquetes.reduce(
      (acc, p) => acc + num(p.area_ha),
      0
    );

    return NextResponse.json({
      ok: true,
      resumo,
      kpis: {
        total_piquetes,
        ocupados,
        area_total_ha,
      },
      piquetes,
    });

  } catch (err: any) {
    console.log("💥 ERRO PASTAGEM:", err);

    return NextResponse.json(
      { ok: false, error: err?.message },
      { status: 500 }
    );
  }
}