import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // necessário para evitar warning SSR (não quebra)
          },
        },
      }
    );

    // 🔐 REGRA Z (AUTH)
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

    // 📊 EQUAÇÃO Y (VIEW)
    const { data, error } = await supabase
      .from("fluxo_caixa_projetado_view")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, reason: "db_error", details: error.message },
        { status: 500 }
      );
    }

    // 🧠 MOTOR DE INTELIGÊNCIA
    let risco = "SAUDAVEL";
    let recomendacao = "MANTER_OPERACAO";

    if (data && data.length > 0) {
      const menorSaldo = Math.min(...data.map((d) => d.saldo_acumulado));

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
      indicadores: {
        risco,
        recomendacao,
      },
    });

  } catch (err) {
    return NextResponse.json(
      { ok: false, reason: "internal_error" },
      { status: 500 }
    );
  }
}