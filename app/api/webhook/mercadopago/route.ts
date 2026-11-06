// app/api/webhook/mercadopago/route.ts
// Versão segura: preços do banco, sem upsert (usa select/insert)

import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
const paymentClient = new Payment(mp);

async function getPrecosFromDatabase(plano: string) {
  const { data } = await supabase
    .from("planos_precos")
    .select("preco_mensal, preco_trimestral, preco_anual")
    .eq("plano_codigo", plano)
    .maybeSingle();
  if (!data) return null;
  return { mensal: data.preco_mensal, trimestral: data.preco_trimestral, anual: data.preco_anual };
}

async function getPromocaoById(id: string) {
  const { data, error } = await supabase
    .from("promocoes_comerciais")
    .select("id,desconto,planos,periodos,data_inicio,data_fim")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`promotion_lookup_failed:${error.code}`);
  }

  return data;
}
function parseExternalReference(ref: string | null) {
  if (!ref) return null;
  const [user_id, plano, periodo] = ref.split("|");
  if (!user_id || !plano || !periodo) return null;
  return { user_id, plano, periodo };
}

function isValidValue(esperado: number, recebido: number) {
  return Math.abs(recebido - esperado) < 0.1;
}

function calcularRenovacao(periodo: string) {
  const renovacao = new Date();
  if (periodo === "mensal") renovacao.setMonth(renovacao.getMonth() + 1);
  if (periodo === "trimestral") renovacao.setMonth(renovacao.getMonth() + 3);
  if (periodo === "anual") renovacao.setFullYear(renovacao.getFullYear() + 1);
  return renovacao.toISOString();
}

export async function POST(req: NextRequest) {
  const ambiente = process.env.VERCEL_ENV ?? "development";
  const isProducao = ambiente === "production";

  const MP_TOKEN = isProducao
    ? process.env.MERCADOPAGO_ACCESS_TOKEN
    : process.env.MERCADOPAGO_ACCESS_TOKEN_TESTE;

  console.log("[ESR_MP_OUTPUT]", {
    ambiente,
    origem_credencial: isProducao
      ? "MERCADOPAGO_ACCESS_TOKEN"
      : "MERCADOPAGO_ACCESS_TOKEN_TESTE",
    token_configurado: Boolean(MP_TOKEN),
  });

  if (!MP_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        error: "mercadopago_access_token_nao_resolvido",
      },
      { status: 500 }
    );
  }

  const mp = new MercadoPagoConfig({
    accessToken: MP_TOKEN,
  });

  const paymentClient = new Payment(mp);
  const startTime = Date.now();
  try {
    const body = await req.json();
    const paymentId = body?.data?.id;
    const eventType = body?.type;
    console.log("🔥 WEBHOOK CHAMADO", { paymentId, eventType });
    if (!paymentId || eventType !== "payment") return NextResponse.json({ ok: true, ignored: true });

    const payment = await paymentClient.get({ id: paymentId });
    if (!payment) return NextResponse.json({ ok: false, error: "payment_not_found" }, { status: 404 });

    const status = payment.status;
    const externalRef = payment.external_reference;
    const valorPago = Number(payment.transaction_amount);
    const moeda = payment.currency_id ?? "BRL";

    const parsed = parseExternalReference(externalRef);
    if (!parsed) return NextResponse.json({ ok: false, error: "invalid_external_reference" }, { status: 400 });
    const { user_id, plano, periodo } = parsed;

    const precos = await getPrecosFromDatabase(plano);
    if (!precos) {
      return NextResponse.json(
        { ok: false, error: "plan_not_found" },
        { status: 400 }
      );
    }

    const precoEsperado = precos[periodo as keyof typeof precos];

    if (!precoEsperado || !Number.isFinite(Number(precoEsperado))) {
      return NextResponse.json(
        { ok: false, error: "invalid_period" },
        { status: 400 }
      );
    }

    const precoBaseCentavos = Math.round(Number(precoEsperado) * 100);
    const valorPagoCentavos = Math.round(valorPago * 100);
    const metadata = payment.metadata ?? {};
    const promocaoId =
      typeof metadata.promocao_id === "string"
        ? metadata.promocao_id
        : null;

    if (precoBaseCentavos <= 0 || !Number.isFinite(valorPagoCentavos)) {
      return NextResponse.json(
        { ok: false, error: "invalid_payment_amount" },
        { status: 400 }
      );
    }

    if (promocaoId) {
      const desconto = Number(metadata.desconto_percentual);
      const baseInformada = Number(metadata.preco_base_centavos);
      const finalInformado = Number(metadata.preco_final_centavos);
      const aplicadaEm = metadata.promocao_aplicada_em;

      const instanteAplicacao =
        typeof aplicadaEm === "string"
          ? new Date(aplicadaEm).getTime()
          : NaN;

      if (
        !Number.isInteger(desconto) ||
        ![5, 10, 15, 20].includes(desconto) ||
        !Number.isFinite(instanteAplicacao) ||
        baseInformada !== precoBaseCentavos
      ) {
        return NextResponse.json(
          { ok: false, error: "invalid_promotion_metadata" },
          { status: 400 }
        );
      }

      const campanha = await getPromocaoById(promocaoId);

      if (
        !campanha ||
        Number(campanha.desconto) !== desconto ||
        !Array.isArray(campanha.planos) ||
        !Array.isArray(campanha.periodos) ||
        !campanha.planos.includes(plano) ||
        !campanha.periodos.includes(periodo) ||
        !campanha.data_inicio ||
        !campanha.data_fim
      ) {
        return NextResponse.json(
          { ok: false, error: "promotion_not_valid" },
          { status: 400 }
        );
      }

      const inicioCampanha = new Date(campanha.data_inicio).getTime();
      const fimCampanha = new Date(campanha.data_fim).getTime();

      if (
        !Number.isFinite(inicioCampanha) ||
        !Number.isFinite(fimCampanha) ||
        instanteAplicacao < inicioCampanha ||
        instanteAplicacao > fimCampanha
      ) {
        return NextResponse.json(
          { ok: false, error: "promotion_outside_validity" },
          { status: 400 }
        );
      }

      if (
        payment.date_created &&
        instanteAplicacao > new Date(payment.date_created).getTime()
      ) {
        return NextResponse.json(
          { ok: false, error: "promotion_timestamp_after_payment" },
          { status: 400 }
        );
      }

      const precoCalculadoCentavos = Math.round(
        precoBaseCentavos * (100 - desconto) / 100
      );

      if (
        finalInformado !== precoCalculadoCentavos ||
        valorPagoCentavos !== precoCalculadoCentavos
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "promotional_value_mismatch",
            esperado_centavos: precoCalculadoCentavos,
            recebido_centavos: valorPagoCentavos,
          },
          { status: 400 }
        );
      }
    } else {
      // Compatibilidade com pagamentos antigos sem promoção.
      if (!isValidValue(precoEsperado, valorPago)) {
        return NextResponse.json(
          {
            ok: false,
            error: "valor_mismatch",
            esperado: precoEsperado,
            recebido: valorPago,
          },
          { status: 400 }
        );
      }
    }

    if (moeda !== "BRL") {
      return NextResponse.json(
        { ok: false, error: "currency_mismatch", moeda },
        { status: 400 }
      );
    }

    // Idempotência: verifica se log já existe
    const { data: existingLog } = await supabase.from("financeiro_logs").select("id").eq("payment_id", paymentId).maybeSingle();
    if (existingLog) return NextResponse.json({ ok: true, idempotent: true });

    // Insere log financeiro
    await supabase.from("financeiro_logs").insert({
      payment_id: paymentId, user_id, plano, periodo, valor: valorPago, moeda,
      origem: "mercadopago", evento: status, external_reference: externalRef, criado_em: new Date().toISOString(),
    });

    if (status === "approved") {
      const renovacao_em = calcularRenovacao(periodo);
      const assinaturaData = { status: "ativa", plano, nivel: plano, valor: valorPago, metodo_pagamento: "mercadopago", renovacao_em, expires_at: renovacao_em, updated_at: new Date().toISOString() };
      const { data: existingAssinatura } = await supabase.from("assinaturas").select("id").eq("user_id", user_id).maybeSingle();
      if (existingAssinatura) {
        await supabase.from("assinaturas").update(assinaturaData).eq("id", existingAssinatura.id);
      } else {
        await supabase.from("assinaturas").insert({ user_id, ...assinaturaData, criado_em: new Date().toISOString() });
      }
    }

    // =====================================================
    // ESR ? OBSERVA??O P?S-PERSIST?NCIA
    // N?o participa da autoriza??o, pre?o ou ativa??o.
    // Falha do ESR n?o invalida o pagamento j? processado.
    // =====================================================
    if (status === "approved") {
      try {
        const pythonBaseUrl =
          process.env.PYTHON_API_URL ||
          process.env.PYTHON_RUNTIME_URL?.replace(
            /\/api\/importar\/arquivo\/?$/,
            ""
          );

        const esrToken = process.env.ESR_INTERNAL_TOKEN;

        if (pythonBaseUrl && esrToken) {
          const esrResponse = await fetch(
            `${pythonBaseUrl}/api/esr/evento-financeiro`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-ESR-Internal-Token": esrToken,
              },
              body: JSON.stringify({
                user_id,
                evento: "PAYMENT_APPROVED",
                payload: {
                  source: "mercadopago",
                  payment_id: String(paymentId),
                  status,
                  plano,
                  periodo,
                  valor: valorPago,
                  moeda,
                  external_reference: externalRef,
                },
              }),
              cache: "no-store",
              signal: AbortSignal.timeout(1500),
            }
          );

          if (!esrResponse.ok) {
            console.warn(
              "[ESR] Observa??o rejeitada pelo Runtime:",
              esrResponse.status
            );
          }
        } else {
          console.warn(
            "[ESR] Configura??o ausente; pagamento preservado."
          );
        }
      } catch (esrError) {
        console.warn(
          "[ESR] Falha observacional ? pagamento preservado:",
          esrError
        );
      }
    }

    console.log(`✅ Webhook processado em ${Date.now() - startTime}ms`);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: "webhook_failure" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "mercadopago_webhook", status: "alive" });
}
