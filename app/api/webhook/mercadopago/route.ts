
import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * PECUARIATECH — MPVEC
 * ESR SIMBIÓTICA + TRIÂNGULO ESPELHADO 360°
 *
 * X = interface e entrada comercial
 * Y = verdade de dados e persistência financeira
 * Z = identidade, autorização e governança
 * π = processamento operacional
 * Ω = correlação e coerência
 *
 * Ciclo ESR:
 * ANTECIPAR → OBSERVAR → ADAPTAR → ESPELHAR → CONVERGIR
 *
 * Este webhook:
 * - valida o pagamento junto do Mercado Pago;
 * - consulta o preço oficial em Y;
 * - regista o evento financeiro;
 * - persiste a assinatura após aprovação;
 * - notifica o Runtime ESR sem lhe delegar a autoridade financeira.
 *
 * Não inicializar clientes externos no carregamento do módulo.
 */

// ======================================================
// Y — CLIENTE SUPABASE
// ======================================================

function criarClienteSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("supabase_config_missing");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// ======================================================
// Y — PREÇOS OFICIAIS
// ======================================================

type PrecosOficiaisRow = {
  preco_mensal: number | string | null;
  preco_trimestral: number | string | null;
  preco_anual: number | string | null;
};

type PrecosOficiais = {
  mensal: number;
  trimestral: number;
  anual: number;
};

async function getPrecosFromDatabase(
  supabase: ReturnType<typeof criarClienteSupabase>,
  plano: string
): Promise<PrecosOficiais | null> {
  const { data, error } = await supabase
    .from("planos_precos")
    .select("preco_mensal, preco_trimestral, preco_anual")
    .eq("plano_codigo", plano)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = data as unknown as PrecosOficiaisRow | null;

  if (!row) {
    return null;
  }

  const mensal = Number(row.preco_mensal);
  const trimestral = Number(row.preco_trimestral);
  const anual = Number(row.preco_anual);

  if (
    !Number.isFinite(mensal) ||
    !Number.isFinite(trimestral) ||
    !Number.isFinite(anual)
  ) {
    throw new Error("invalid_plan_price_configuration");
  }

  return { mensal, trimestral, anual };
}

// ======================================================
// Ω — CORRELAÇÃO DA REFERÊNCIA COMERCIAL
// ======================================================

function parseExternalReference(ref: string | null | undefined) {
  if (!ref) {
    return null;
  }

  const [user_id, plano, periodo] = ref.split("|");

  if (!user_id || !plano || !periodo) {
    return null;
  }

  return {
    user_id,
    plano,
    periodo,
  };
}

// ======================================================
// Y — VALIDAÇÃO FINANCEIRA
// ======================================================

function isValidValue(esperado: number, recebido: number) {
  return (
    Number.isFinite(esperado) &&
    Number.isFinite(recebido) &&
    Math.abs(recebido - esperado) < 0.1
  );
}

function calcularRenovacao(periodo: string) {
  const renovacao = new Date();

  if (periodo === "mensal") {
    renovacao.setMonth(renovacao.getMonth() + 1);
  } else if (periodo === "trimestral") {
    renovacao.setMonth(renovacao.getMonth() + 3);
  } else if (periodo === "anual") {
    renovacao.setFullYear(renovacao.getFullYear() + 1);
  } else {
    throw new Error("invalid_period");
  }

  return renovacao.toISOString();
}

// ======================================================
// MPVEC — ENTRADA DO WEBHOOK
// ======================================================

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

  try {
    const supabase = criarClienteSupabase();

    const mp = new MercadoPagoConfig({
      accessToken: MP_TOKEN,
    });

    const paymentClient = new Payment(mp);

    const body = await req.json();

    const paymentId = body?.data?.id;
    const eventType = body?.type;

    console.log("[MPVEC][OBSERVAR] Webhook recebido", {
      paymentId,
      eventType,
    });

    if (!paymentId || eventType !== "payment") {
      return NextResponse.json({
        ok: true,
        ignored: true,
      });
    }

    // π — Consultar o pagamento na origem financeira.
    const payment = await paymentClient.get({
      id: paymentId,
    });

    if (!payment) {
      return NextResponse.json(
        {
          ok: false,
          error: "payment_not_found",
        },
        { status: 404 }
      );
    }

    const status = payment.status;
    const externalRef = payment.external_reference ?? null;
    const valorPago = Number(payment.transaction_amount);
    const moeda = payment.currency_id ?? "BRL";

    // Ω — Correlacionar o pagamento com a referência comercial.
    const parsed = parseExternalReference(externalRef);

    if (!parsed) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_external_reference",
        },
        { status: 400 }
      );
    }

    const { user_id, plano, periodo } = parsed;

    // Y — Preço oficial e integridade comercial.
    const precos = await getPrecosFromDatabase(supabase, plano);

    if (!precos) {
      return NextResponse.json(
        {
          ok: false,
          error: "plan_not_found",
        },
        { status: 400 }
      );
    }

    if (
      periodo !== "mensal" &&
      periodo !== "trimestral" &&
      periodo !== "anual"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_period",
        },
        { status: 400 }
      );
    }

    const precoEsperado = precos[periodo];

    if (
      !Number.isFinite(precoEsperado) ||
      precoEsperado <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_configured_price",
        },
        { status: 500 }
      );
    }

    if (!isValidValue(precoEsperado, valorPago)) {
      console.warn("[MPVEC][Y] Divergência de valor", {
        paymentId: String(paymentId),
        plano,
        periodo,
      });

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

    if (moeda !== "BRL") {
      return NextResponse.json(
        {
          ok: false,
          error: "currency_mismatch",
          moeda,
        },
        { status: 400 }
      );
    }

// ======================================================
// Y — REGISTO FINANCEIRO E IDEMPOTÊNCIA
// ======================================================

    const paymentIdString = String(paymentId);

    const {
      data: existingLog,
      error: existingLogError,
    } = await supabase
      .from("financeiro_logs")
      .select("id, evento, validado")
      .eq("payment_id", paymentIdString)
      .maybeSingle();

    if (existingLogError) {
      throw existingLogError;
    }

    if (existingLog) {
      const { error: logUpdateError } = await supabase
        .from("financeiro_logs")
        .update({
          evento: status,
          validado: status === "approved",
        })
        .eq("id", existingLog.id);

      if (logUpdateError) {
        throw logUpdateError;
      }

      if (status !== "approved") {
        return NextResponse.json({
          ok: true,
          ignored: true,
          status,
          idempotent: true,
        });
      }
    } else {
      const { error: logError } = await supabase
        .from("financeiro_logs")
        .insert({
          payment_id: paymentIdString,
          user_id,
          plano,
          periodo,
          valor: valorPago,
          moeda,
          origem: "mercadopago",
          evento: status,
          external_reference: externalRef,
          criado_em: new Date().toISOString(),
          validado: status === "approved",
        });

      if (logError) {
        throw logError;
      }

      if (status !== "approved") {
        return NextResponse.json({
          ok: true,
          ignored: true,
          status,
        });
      }
    }

// ======================================================
// Y — PERSISTÊNCIA DA ASSINATURA
// ======================================================

    if (status === "approved") {
      const agora = new Date();

      const dataInicio = agora.toISOString().slice(0, 10);
      const dataFim = calcularRenovacao(periodo).slice(0, 10);

      const assinaturaData = {
        status: "ativo",
        plano,
        valor_pago: valorPago,
        data_inicio: dataInicio,
        data_fim: dataFim,
        atualizado_em: agora.toISOString(),
      };

      const {
        data: existingAssinatura,
        error: existingAssinaturaError,
      } = await supabase
        .from("assinaturas")
        .select("id")
        .eq("user_id", user_id)
        .order("atualizado_em", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingAssinaturaError) {
        throw existingAssinaturaError;
      }

      if (existingAssinatura) {
        const { error: assinaturaUpdateError } = await supabase
          .from("assinaturas")
          .update(assinaturaData)
          .eq("id", existingAssinatura.id);

        if (assinaturaUpdateError) {
          throw assinaturaUpdateError;
        }
      } else {
        const { error: assinaturaInsertError } = await supabase
          .from("assinaturas")
          .insert({
            user_id,
            ...assinaturaData,
            criado_em: agora.toISOString(),
          });

        if (assinaturaInsertError) {
          throw assinaturaInsertError;
        }
      }
    }

// ======================================================
// ESR — OBSERVAÇÃO PÓS-PERSISTÊNCIA
// ======================================================

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
                  payment_id: paymentIdString,
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
              "[ESR][OBSERVAR] Runtime rejeitou o evento:",
              esrResponse.status
            );
          }
        } else {
          console.warn(
            "[ESR][OBSERVAR] Configuração ausente; persistência preservada."
          );
        }
      } catch (esrError) {
        console.warn(
          "[ESR][OBSERVAR] Falha observacional; persistência preservada:",
          esrError instanceof Error
            ? esrError.message
            : "erro desconhecido"
        );
      }
    }

    console.log("[MPVEC][CONVERGIR] Webhook processado", {
      duracao_ms: Date.now() - startTime,
      status,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "[MPVEC][ERRO] Falha no webhook:",
      error instanceof Error
        ? error.message
        : "erro desconhecido"
    );

    return NextResponse.json(
      {
        ok: false,
        error: "webhook_failure",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// ENDPOINT DE DIAGNÓSTICO — SEM DADOS SENSÍVEIS
// ======================================================

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "mercadopago_webhook",
      status: "alive",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
