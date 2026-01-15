// CAMINHO: app/api/assinaturas/status/route.ts
// Status canônico da assinatura — PecuariaTech
// Fonte única: public.assinaturas (por user_id)
// Equação Y: Cookie SSR → user_id → assinatura → middleware

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

    // ✅ Resposta que permite ler cookies do request
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

    // ✅ 1) pegar usuário da sessão (cookie SSR)
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user?.id) {
      return NextResponse.json(
        { ativo: false, error: "no_user_session" },
        { status: 200 }
      );
    }

    const user_id = userData.user.id;

    // ✅ 2) buscar assinatura por user_id
    const { data: assinatura, error: subErr } = await supabase
      .from("assinaturas")
      .select("id, user_id, plano_id, status, metodo_pagamento, valor")
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
        { ativo: false, error: "no_subscription" },
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
        user_id,
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
