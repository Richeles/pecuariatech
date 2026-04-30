import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // ✅ SSR COOKIE-FIRST CORRETO (FIX OFICIAL)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // 🔐 AUTH (Regra Z)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, reason: "no_session" },
        { status: 401 }
      );
    }

    // 📊 BUSCAR FLUXO (Equação Y)
    const { data, error } = await supabase
      .from("fluxo_caixa_projetado_view")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: true });

    // ❗ DEBUG REAL DO BANCO (ESSENCIAL)
    if (error) {
      console.error("❌ ERRO SUPABASE:", error);

      return NextResponse.json(
        {
          ok: false,
          reason: "db_error",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 🧠 INTELIGÊNCIA (CFO ENGINE)
    let risco = "SAUDAVEL";
    let recomendacao = "MANTER_OPERACAO";

    if (data && data.length > 0) {
      const menorSaldo = Math.min(
        ...data.map((d) => Number(d.saldo_acumulado || 0))
      );

      if (menorSaldo < 0) {
        risco = "CRITICO";
        recomendacao = "ANTECIPAR_RECEITA_OU_REDUZIR_CUSTOS";
      } else if (menorSaldo <= 5000) {
        risco = "ATENCAO";
        recomendacao = "CONTROLAR_CUSTOS";
      }
    }

    return NextResponse.json({
      ok: true,
      fluxo: data || [],
      resumo: {
        risco,
        recomendacao,
      },
    });
  } catch (err: any) {
    console.error("❌ ERRO INTERNO:", err);

    return NextResponse.json(
      {
        ok: false,
        reason: "internal_error",
        details: err?.message || "unknown",
      },
      { status: 500 }
    );
  }
}