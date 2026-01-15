// CAMINHO: app/api/assinaturas/status/route.ts
// Status canônico da assinatura — PecuariaTech
// Blindado com fallback automático:
// 1) tenta view assinatura_ativa_view
// 2) se view falhar, cai para tabela assinaturas (fonte real)

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!url || !anon) {
      return NextResponse.json(
        { ativo: false, error: "missing_env" },
        { status: 200 }
      );
    }

    const res = NextResponse.next();

    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    });

    // 1) sessão via cookie SSR
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user?.id) {
      return NextResponse.json(
        { ativo: false, error: "no_user_session" },
        { status: 200 }
      );
    }

    const user_id = userData.user.id;

    // ==========================================================
    // 2) TENTATIVA 1 (PREFERIDA): VIEW CANÔNICA
    // ==========================================================
    try {
      const { data: v, error: vErr } = await supabase
        .from("assinatura_ativa_view")
        .select("*")
        .eq("user_id", user_id)
        .limit(1)
        .maybeSingle();

      if (!vErr && v) {
        const ativo = String(v.status).toLowerCase() === "ativa";

        return NextResponse.json(
          {
            ativo,
            status: v.status ?? null,
            user_id,
            plano_id: v.plano_id ?? null,
            plano_codigo: v.plano_codigo ?? null,
            plano_nome: v.plano_nome ?? null,
            plano_nivel: v.plano_nivel ?? null,
            metodo_pagamento: v.metodo_pagamento ?? null,
            valor: v.valor ?? null,
            inicio_trial: v.inicio_trial ?? null,
            fim_trial: v.fim_trial ?? null,
            renovacao_em: v.renovacao_em ?? null,
            source: "view",
          },
          { status: 200 }
        );
      }

      // Se view não retornou nada (sem erro):
      if (!vErr && !v) {
        return NextResponse.json(
          { ativo: false, error: "no_subscription", user_id, source: "view" },
          { status: 200 }
        );
      }

      // Se view deu erro, cai no fallback:
      // (não retorna aqui)
    } catch (e: any) {
      // caiu no fallback
    }

    // ==========================================================
    // 3) FALLBACK DEFINITIVO: TABELA REAL public.assinaturas
    // ==========================================================
    const { data: assinatura, error: subErr } = await supabase
      .from("assinaturas")
      .select(
        "id, user_id, plano_id, status, metodo_pagamento, valor, inicio_trial, fim_trial, renovacao_em, criado_em, atualizado_em"
      )
      .eq("user_id", user_id)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subErr) {
      return NextResponse.json(
        { ativo: false, error: "assinatura_query_error", detail: subErr.message },
        { status: 200 }
      );
    }

    if (!assinatura) {
      return NextResponse.json(
        { ativo: false, error: "no_subscription", user_id, source: "fallback" },
        { status: 200 }
      );
    }

    const ativo = String(assinatura.status).toLowerCase() === "ativa";

    return NextResponse.json(
      {
        ativo,
        status: assinatura.status,
        plano_id: assinatura.plano_id,
        metodo_pagamento: assinatura.metodo_pagamento,
        valor: assinatura.valor,
        inicio_trial: assinatura.inicio_trial,
        fim_trial: assinatura.fim_trial,
        renovacao_em: assinatura.renovacao_em,
        user_id,
        source: "fallback",
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ativo: false, error: "status_exception", detail: e?.message || "error" },
      { status: 200 }
    );
  }
}
