// app/api/checkout/preference/route.ts
// PecuariaTech — Checkout Runtime Premium
// Equação Y + Regra Z + Runtime SaaS Seguro
// 🔥 CORRIGIDO: Valida usuário via cookie SSR (não confia no cliente)

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import MercadoPagoConfig, { Preference } from "mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* =====================================================
   PLANOS
===================================================== */

const PLANOS = {
  basico: { titulo: "Plano B?sico" },
  profissional: { titulo: "Plano Profissional" },
  ultra: { titulo: "Plano Ultra" },
  empresarial: { titulo: "Plano Empresarial" },
  premium_dominus: { titulo: "Premium Dominus 360?" },
} as const;

const PLANO_ALIAS: Record<string, keyof typeof PLANOS> = {
  basico: "basico",
  profissional: "profissional",
  ultra: "ultra",
  empresarial: "empresarial",
  dominus: "premium_dominus",
  premium_dominus: "premium_dominus",
};

/* =====================================================
   HELPERS
===================================================== */

function n(v: any): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function safeOrigin(req: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    req.headers.get("origin") ||
    "https://www.pecuariatech.com"
  );
}

/* =====================================================
   PYTHON PRICING
===================================================== */

async function getPriceFromDatabase(
  plano: string,
  periodo: "mensal" | "trimestral" | "anual"
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("supabase_env_missing");
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/planos_precos?select=preco_mensal,preco_trimestral,preco_anual,ativo&plano_codigo=eq.${encodeURIComponent(plano)}&ativo=eq.true`,
    {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`planos_precos_http_${response.status}`);
  }

  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : null;

  if (!row) {
    throw new Error("plan_not_found");
  }

  const preco = n(row[`preco_${periodo}`]);

  if (preco <= 0) {
    throw new Error("invalid_plan_price");
  }

  return preco;
}

/* =====================================================
   POST
===================================================== */

export async function POST(req: NextRequest) {
  try {
    /* ==========================================
       🔥 VALIDAÇÃO SSR (Equação Y)
       O usuário é obtido do COOKIE, não do cliente!
    ========================================== */

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[CHECKOUT] Missing Supabase env");
      return NextResponse.json(
        { ok: false, error: "missing_env" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[CHECKOUT] User not authenticated:", userError);
      return NextResponse.json(
        { ok: false, error: "unauthorized", message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const user_id = user.id;
    const email = user.email;

    console.log("[CHECKOUT] Usuário autenticado:", { user_id, email });

    /* ==========================================
       ENV
    ========================================== */

    const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!MP_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "MERCADOPAGO_ACCESS_TOKEN ausente" },
        { status: 500 }
      );
    }

    /* ==========================================
       BODY
    ========================================== */

    const body = await req.json();
    const planoRecebido = String(body?.plano || "").toLowerCase();
    const periodo = String(body?.periodo || "");

    const plano = PLANO_ALIAS[planoRecebido];

    console.log("[CHECKOUT]", {
      planoRecebido,
      plano,
      periodo,
      email,
    });

    /* ==========================================
       VALIDATION
    ========================================== */

    if (!plano || !PLANOS[plano]) {
      return NextResponse.json(
        { ok: false, error: "Plano inv?lido" },
        { status: 400 }
      );
    }

    if (!["mensal", "trimestral", "anual"].includes(periodo)) {
      return NextResponse.json(
        { ok: false, error: "Per?odo inv?lido" },
        { status: 400 }
      );
    }

    /* ==========================================
       PRE?O ? FONTE ?NICA: Supabase
    ========================================== */

    const preco = await getPriceFromDatabase(
      plano,
      periodo as "mensal" | "trimestral" | "anual"
    );

    /* ==========================================
       ORIGIN
    ========================================== */

    const origin = safeOrigin(req);

    /* ==========================================
       URLS
    ========================================== */

    const successUrl = `${origin}/dashboard`;
    const failureUrl = `${origin}/planos`;
    const pendingUrl = `${origin}/planos`;
    const webhookUrl = process.env.WEBHOOK_PUBLIC_URL || `${origin}/api/webhook/mercadopago`;

    console.log("[CHECKOUT_URLS]", {
      origin,
      successUrl,
      failureUrl,
      pendingUrl,
      webhookUrl,
    });

    /* ==========================================
       MERCADO PAGO
    ========================================== */

    const mp = new MercadoPagoConfig({ accessToken: MP_TOKEN });
    const preference = new Preference(mp);

    const preferenceBody = {
      items: [
        {
          id: `${plano}_${periodo}`,
          title: `${PLANOS[plano].titulo} - ${periodo}`,
          description: `Assinatura ${PLANOS[plano].titulo}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(preco),
        },
      ],
      payer: { email },
      metadata: { user_id, plano, periodo },
      external_reference: `${user_id}|${plano}|${periodo}`,
      back_urls: { success: successUrl, failure: failureUrl, pending: pendingUrl },
      notification_url: webhookUrl,
    };

    const result = await preference.create({ body: preferenceBody });

    if (!result?.init_point) {
      throw new Error("mercadopago_init_point_missing");
    }

    return NextResponse.json({
      ok: true,
      provider: "mercadopago",
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      plano,
      periodo,
      preco,
    });
  } catch (err: any) {
    console.error("[CHECKOUT_RUNTIME]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "checkout_runtime_error",
        detalhe: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}