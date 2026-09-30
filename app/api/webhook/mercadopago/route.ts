import { NextRequest, NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



async function getPrecosFromDatabase(plano: string) {
  const { data, error } = await supabase
    .from("planos_precos")
    .select(
      "preco_mensal, preco_trimestral, preco_anual"
    )
    .eq("plano_codigo", plano)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    mensal: Number(data.preco_mensal),
    trimestral: Number(data.preco_trimestral),
    anual: Number(data.preco_anual),
  };
}

function parseExternalReference(ref: string | null) {
  if (!ref) {
    return null;
  }

  const [user_id, plano, periodo] =
    ref.split("|");

  if (!user_id || !plano || !periodo) {
    return null;
  }

  return {
    user_id,
    plano,
    periodo,
  };
}

function isValidValue(
  esperado: number,
  recebido: number
) {
  return (
    Number.isFinite(esperado) &&
    Number.isFinite(recebido) &&
    Math.abs(recebido - esperado) < 0.1
  );
}

function calcularRenovacao(periodo: string) {
  const renovacao = new Date();

  if (periodo === "mensal") {
    renovacao.setMonth(
      renovacao.getMonth() + 1
    );
  } else if (periodo === "trimestral") {
    renovacao.setMonth(
      renovacao.getMonth() + 3
    );
  } else if (periodo === "anual") {
    renovacao.setFullYear(
      renovacao.getFullYear() + 1
    );
  } else {
    throw new Error("invalid_period");
  }

  return renovacao.toISOString();
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ambiente =
    process.env.VERCEL_ENV ??
    "development";

  const isProducao =
    ambiente === "production";

  const MP_TOKEN =
    isProducao
      ? process.env.MERCADOPAGO_ACCESS_TOKEN
      : process.env.MERCADOPAGO_ACCESS_TOKEN_TESTE;

  console.log(
    "[ESR_MP_OUTPUT]",
    {
      ambiente,
      origem_credencial:
        isProducao
          ? "MERCADOPAGO_ACCESS_TOKEN"
          : "MERCADOPAGO_ACCESS_TOKEN_TESTE",
      token_configurado:
        Boolean(MP_TOKEN),
    }
  );

  if (!MP_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "mercadopago_access_token_nao_resolvido",
      },
      { status: 500 }
    );
  }

  const mp =
    new MercadoPagoConfig({
      accessToken: MP_TOKEN,
    });

  const paymentClient =
    new Payment(mp);

  try {
    const body = await req.json();

    const paymentId = body?.data?.id;
    const eventType = body?.type;

    console.log(
      "WEBHOOK CHAMADO",
      {
        paymentId,
        eventType,
      }
    );

    /*
     * =====================================================
     * TRIÂNGULO ESPELHADO 360°
     *
     * Este webhook é a entrada financeira do eixo Y.
     *
     * Y = verdade/persistência
     * ESR = observação e regência transversal
     * Z = governança/autorização
     *
     * O ESR não autoriza, não calcula preço e não bloqueia
     * o pagamento. A persistência financeira permanece
     * soberana neste fluxo.
     * =====================================================
     */

    if (
      !paymentId ||
      eventType !== "payment"
    ) {
      return NextResponse.json({
        ok: true,
        ignored: true,
      });
    }

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

    const externalRef =
      payment.external_reference;

    const valorPago = Number(
      payment.transaction_amount
    );

    const moeda =
      payment.currency_id ?? "BRL";

    const parsed =
      parseExternalReference(externalRef);

    if (!parsed) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_external_reference",
        },
        { status: 400 }
      );
    }

    const {
      user_id,
      plano,
      periodo,
    } = parsed;

    /*
     * =====================================================
     * Y — VERDADE COMERCIAL
     *
     * O valor oficial continua vindo de planos_precos.
     * O webhook nunca confia no valor recebido pelo cliente.
     * =====================================================
     */

    const precos =
      await getPrecosFromDatabase(plano);

    if (!precos) {
      return NextResponse.json(
        {
          ok: false,
          error: "plan_not_found",
        },
        { status: 400 }
      );
    }

    const precoEsperado =
      precos[
        periodo as keyof typeof precos
      ];

    if (!precoEsperado) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_period",
        },
        { status: 400 }
      );
    }

    if (
      !isValidValue(
        precoEsperado,
        valorPago
      )
    ) {
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

    /*
     * =====================================================
     * Y — FINANCEIRO / IDEMPOTÊNCIA
     * =====================================================
     */

    const {
      data: existingLog,
      error: existingLogError,
    } = await supabase
      .from("financeiro_logs")
      .select(
        "id, evento, validado"
      )
      .eq(
        "payment_id",
        String(paymentId)
      )
      .maybeSingle();

    if (existingLogError) {
      throw existingLogError;
    }

    if (existingLog) {
      const {
        error: logUpdateError,
      } = await supabase
        .from("financeiro_logs")
        .update({
          evento: status,
          validado:
            status === "approved",
        })
        .eq(
          "id",
          existingLog.id
        );

      if (logUpdateError) {
        throw logUpdateError;
      }

      /*
       * Pagamentos ainda não aprovados permanecem
       * registrados como observação financeira.
       */
      if (status !== "approved") {
        return NextResponse.json({
          ok: true,
          ignored: true,
          status,
          idempotent: true,
        });
      }

      /*
       * APPROVED continua para a ativação.
       */
    } else {
      const {
        error: logError,
      } = await supabase
        .from("financeiro_logs")
        .insert({
          payment_id:
            String(paymentId),
          user_id,
          plano,
          periodo,
          valor: valorPago,
          moeda,
          origem:
            "mercadopago",
          evento: status,
          external_reference:
            externalRef,
          criado_em:
            new Date().toISOString(),
          validado:
            status === "approved",
        });

      if (logError) {
        throw logError;
      }

      /*
       * Somente pagamento aprovado pode liberar
       * a assinatura.
       */
      if (status !== "approved") {
        return NextResponse.json({
          ok: true,
          ignored: true,
          status,
        });
      }
    }

    /*
     * =====================================================
     * Y — ASSINATURA
     * =====================================================
     */

    if (status === "approved") {
      const dataInicio =
        new Date()
          .toISOString()
          .slice(0, 10);

      const dataFim =
        calcularRenovacao(
          periodo
        ).slice(0, 10);

      const assinaturaData = {
        status: "ativa",
        plano,
        valor_pago:
          valorPago,
        data_inicio:
          dataInicio,
        data_fim:
          dataFim,
        atualizado_em:
          new Date().toISOString(),
      };

      const {
        data: existingAssinatura,
        error:
          existingAssinaturaError,
      } = await supabase
        .from("assinaturas")
        .select("id")
        .eq(
          "user_id",
          user_id
        )
        .maybeSingle();

      if (
        existingAssinaturaError
      ) {
        throw existingAssinaturaError;
      }

      if (existingAssinatura) {
        const {
          error:
            assinaturaUpdateError,
        } = await supabase
          .from("assinaturas")
          .update(
            assinaturaData
          )
          .eq(
            "id",
            existingAssinatura.id
          );

        if (assinaturaUpdateError) {
          throw assinaturaUpdateError;
        }
      } else {
        const {
          error:
            assinaturaInsertError,
        } = await supabase
          .from("assinaturas")
          .insert({
            user_id,
            ...assinaturaData,
            criado_em:
              new Date().toISOString(),
          });

        if (
          assinaturaInsertError
        ) {
          throw assinaturaInsertError;
        }
      }
    }

    /*
     * =====================================================
     * ESR — OBSERVAÇÃO PÓS-PERSISTÊNCIA
     *
     * O pagamento e a assinatura já foram persistidos
     * no eixo Y antes da chamada ao ESR.
     *
     * O ESR:
     * - observa;
     * - registra/coleta o evento;
     * - não autoriza;
     * - não bloqueia;
     * - não substitui Y.
     *
     * Uma falha do ESR não desfaz a verdade financeira.
     * =====================================================
     */

    if (status === "approved") {
      try {
        const pythonBaseUrl =
          process.env.PYTHON_API_URL ||
          process.env.PYTHON_RUNTIME_URL?.replace(
            /\/api\/importar\/arquivo\/?$/,
            ""
          );

        const esrToken =
          process.env.ESR_INTERNAL_TOKEN;

        if (
          pythonBaseUrl &&
          esrToken
        ) {
          const esrResponse =
            await fetch(
              `${pythonBaseUrl}/api/esr/evento-financeiro`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                  "X-ESR-Internal-Token":
                    esrToken,
                },
                body: JSON.stringify({
                  user_id,
                  evento:
                    "PAYMENT_APPROVED",
                  payload: {
                    source:
                      "mercadopago",
                    payment_id:
                      String(paymentId),
                    status,
                    plano,
                    periodo,
                    valor:
                      valorPago,
                    moeda,
                    external_reference:
                      externalRef,
                  },
                }),
                cache: "no-store",
                signal:
                  AbortSignal.timeout(
                    1500
                  ),
              }
            );

          if (
            !esrResponse.ok
          ) {
            console.warn(
              "[ESR] Observação rejeitada pelo Runtime:",
              esrResponse.status
            );
          }
        } else {
          console.warn(
            "[ESR] Configuração ausente; pagamento preservado."
          );
        }
      } catch (
        esrError
      ) {
        console.warn(
          "[ESR] Falha observacional; pagamento preservado:",
          esrError
        );
      }
    }

    console.log(
      `Webhook processado em ${
        Date.now() -
        startTime
      }ms`
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error: any) {
    console.error(
      "Webhook error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "webhook_failure",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint:
      "mercadopago_webhook",
    status: "alive",
  });
}
