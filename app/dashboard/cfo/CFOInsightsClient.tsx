"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  riskScore,
  scoreTone,
  badgeTone,
  statusText,
  brl,
  pct,
  eixoLabel,
  severidadeTone,
} from "@/app/lib/inteligencia/cfoEngine";

type Eixo360 =
  | "contabil"
  | "operacional"
  | "estrategico";

type SinalCFO = {
  eixo: Eixo360;

  tipo: "alerta" | "info";

  codigo: string;

  severidade:
    | "alta"
    | "media"
    | "baixa";

  prioridade:
    | 1
    | 2
    | 3
    | 4
    | 5;

  mensagem: string;

  acao_sugerida?: string;
};

type CFOResponse = {
  ok: boolean;

  domain: "financeiro";

  ts: string;

  degraded: boolean;

  kpis: {
    receita_total: number;

    custos_totais: number;

    resultado_operacional: number;

    margem_operacional_pct: number;

    saldo_caixa?: number;

    divida_total?: number;

    tendencia_3m?: string;
  };

  sinais: SinalCFO[];

  plano_acao: Array<{
    prioridade:
      | 1
      | 2
      | 3;

    eixo: Eixo360;

    titulo: string;

    descricao: string;

    impacto_estimado_brl?: number;
  }>;

  resumo_executivo: string;

  error?: string;
};

/* =====================================================
   FETCH CFO
===================================================== */

async function fetchCFO(): Promise<CFOResponse> {

  const response = await fetch(
    "/api/inteligencia/financeiro?ts=" +
      Date.now(),
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Falha ao consultar inteligência financeira"
    );
  }

  return response.json();
}

/* =====================================================
   COMPONENT
===================================================== */

export default function CFOInsightsClient() {

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState<CFOResponse | null>(
      null
    );

  const [tab, setTab] =
    useState<
      "todos" | Eixo360
    >("todos");

  const [err, setErr] =
    useState<string | null>(
      null
    );

  /* =====================================================
     DATA
  ===================================================== */

  const kpis =
    data?.kpis;

  const sinais =
    data?.sinais ?? [];

  const plano =
    data?.plano_acao ?? [];

  const degraded =
    Boolean(data?.degraded);

  /* =====================================================
     SCORE
  ===================================================== */

  const score =
    useMemo(() => {

      if (!kpis) {
        return 0;
      }

      return riskScore(kpis);

    }, [kpis]);

  /* =====================================================
     FILTRO
  ===================================================== */

  const sinaisFiltrados =
    useMemo(() => {

      if (tab === "todos") {
        return sinais;
      }

      return sinais.filter(
        (s) => s.eixo === tab
      );

    }, [sinais, tab]);

  /* =====================================================
     BADGE
  ===================================================== */

  const headerBadgeClass =
    badgeTone(
      degraded,
      sinais
    );

  const headerBadgeText =
    statusText(
      degraded,
      sinais
    );

  /* =====================================================
     REFRESH
  ===================================================== */

  async function onRefresh() {

    try {

      setErr(null);

      setLoading(true);

      const response =
        await fetchCFO();

      setData(response);

    } catch (error: any) {

      setErr(
        error?.message ??
          "Erro ao carregar CFO"
      );

    } finally {

      setLoading(false);

    }
  }

  /* =====================================================
     INIT
  ===================================================== */

  useEffect(() => {

    onRefresh();

  }, []);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        space-y-8
        px-6
        py-10
      "
    >

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border border-[#dce9df]
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            border-b
            border-[#edf3ee]
            bg-gradient-to-r
            from-[#f4faf5]
            via-[#f7fbf8]
            to-white
            px-8
            py-8
          "
        >

          <div
            className="
              flex flex-col
              gap-6
              lg:flex-row
              lg:items-start
              lg:justify-between
            "
          >

            {/* =====================================================
                TITULO
            ===================================================== */}

            <div className="space-y-4">

              <div
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-[#d8e5db]
                  bg-white
                  px-4 py-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#2c5a3f]
                "
              >
                🧠 CFO Ultra Runtime
              </div>

              <div>

                <h1
                  className="
                    text-4xl
                    font-black
                    tracking-tight
                    text-[#173222]
                  "
                >
                  Inteligência Financeira
                </h1>

                <p
                  className="
                    mt-3
                    max-w-3xl
                    text-sm
                    leading-relaxed
                    text-[#557564]
                  "
                >
                  Runtime cognitivo
                  operacional baseado
                  em:
                  Triângulo 360,
                  Equação Y,
                  inferência financeira,
                  leitura estrutural
                  e monitoramento
                  operacional contínuo.
                </p>

              </div>

            </div>

            {/* =====================================================
                STATUS
            ===================================================== */}

            <div
              className="
                flex items-center gap-3
              "
            >

              <span
                className={`
                  inline-flex items-center gap-2
                  rounded-full border
                  px-4 py-2
                  text-xs font-black
                  uppercase tracking-wider
                  ${headerBadgeClass}
                `}
              >
                {headerBadgeText}

                {degraded && (
                  <span>
                    • degraded
                  </span>
                )}

              </span>

              <button
                onClick={onRefresh}
                disabled={loading}
                className="
                  rounded-2xl
                  bg-[#173222]
                  px-5 py-3
                  text-sm font-bold
                  text-white
                  transition-all duration-300
                  hover:bg-[#224834]
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Atualizando..."
                  : "Atualizar"}
              </button>

            </div>

          </div>

          {/* =====================================================
              SCORE
          ===================================================== */}

          <div
            className="
              mt-8
              grid gap-5
              lg:grid-cols-3
            "
          >

            {/* SCORE */}

            <div
              className="
                rounded-3xl
                border border-[#dce9df]
                bg-white
                p-6
              "
            >

              <div
                className="
                  flex items-center
                  justify-between
                "
              >

                <h2
                  className="
                    text-sm
                    font-bold
                    text-[#173222]
                  "
                >
                  Risco Operacional
                </h2>

                <span
                  className="
                    text-xs
                    text-[#557564]
                  "
                >
                  0–100
                </span>

              </div>

              <div
                className="
                  mt-4
                  h-3
                  overflow-hidden
                  rounded-full
                  bg-[#edf3ee]
                "
              >

                <div
                  className={`
                    h-3
                    ${scoreTone(score)}
                  `}
                  style={{
                    width: `${score}%`,
                  }}
                />

              </div>

              <div
                className="
                  mt-3
                  text-sm
                  text-[#557564]
                "
              >
                Score atual:

                <span
                  className="
                    ml-2
                    font-black
                    text-[#173222]
                  "
                >
                  {score}
                </span>

              </div>

            </div>

            {/* RESUMO */}

            <div
              className="
                rounded-3xl
                border border-[#dce9df]
                bg-white
                p-6
              "
            >

              <h2
                className="
                  text-sm
                  font-bold
                  text-[#173222]
                "
              >
                Resumo Executivo
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-relaxed
                  text-[#557564]
                "
              >
                {data?.resumo_executivo ??
                  "Carregando inteligência operacional..."}
              </p>

            </div>

            {/* STATUS */}

            <div
              className="
                rounded-3xl
                border border-[#dce9df]
                bg-white
                p-6
              "
            >

              <h2
                className="
                  text-sm
                  font-bold
                  text-[#173222]
                "
              >
                Runtime
              </h2>

              <div
                className="
                  mt-4
                  space-y-3
                  text-sm
                  text-[#557564]
                "
              >

                <div>
                  Fonte:
                  <span
                    className="
                      ml-2
                      font-mono
                    "
                  >
                    /api/inteligencia/financeiro
                  </span>
                </div>

                <div>
                  Atualização:
                  <span
                    className="
                      ml-2
                      font-semibold
                      text-[#173222]
                    "
                  >
                    {data?.ts
                      ? new Date(
                          data.ts
                        ).toLocaleString(
                          "pt-BR"
                        )
                      : "—"}
                  </span>
                </div>

                {err && (
                  <div
                    className="
                      rounded-xl
                      bg-red-50
                      p-3
                      text-red-700
                    "
                  >
                    {err}
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            KPI GRID
        ===================================================== */}

        <div className="px-8 py-8">

          <div
            className="
              grid gap-5
              md:grid-cols-2
              xl:grid-cols-4
            "
          >

            <KPI
              title="Receita Total"
              value={brl(
                kpis?.receita_total ?? 0
              )}
              subtitle="DRE operacional"
            />

            <KPI
              title="Custos Totais"
              value={brl(
                kpis?.custos_totais ?? 0
              )}
              subtitle="Fixos + variáveis"
            />

            <KPI
              title="Resultado Operacional"
              value={brl(
                kpis?.resultado_operacional ?? 0
              )}
              subtitle={`Margem: ${pct(
                kpis?.margem_operacional_pct ??
                  0
              )}`}
              emphasis={
                Number(
                  kpis?.resultado_operacional ??
                    0
                ) < 0
                  ? "neg"
                  : "pos"
              }
            />

            <KPI
              title="Tendência"
              value={
                (
                  kpis?.tendencia_3m ??
                  "misto"
                ).toString()
              }
              subtitle="Direção financeira"
            />

          </div>

        </div>

      </section>

    </div>
  );
}

/* =====================================================
   KPI
===================================================== */

function KPI({
  title,
  value,
  subtitle,
  emphasis,
}: {
  title: string;

  value: string;

  subtitle?: string;

  emphasis?: "neg" | "pos";
}) {

  const tone =
    emphasis === "neg"
      ? `
          border-red-200
          bg-red-50
        `
      : emphasis === "pos"
      ? `
          border-emerald-200
          bg-emerald-50
        `
      : `
          border-[#dce9df]
          bg-white
        `;

  return (
    <div
      className={`
        rounded-3xl
        border
        p-6
        shadow-sm
        ${tone}
      `}
    >

      <div
        className="
          text-xs
          font-black
          uppercase
          tracking-widest
          text-[#557564]
        "
      >
        {title}
      </div>

      <div
        className="
          mt-3
          text-3xl
          font-black
          tracking-tight
          text-[#173222]
        "
      >
        {value}
      </div>

      {subtitle && (
        <div
          className="
            mt-2
            text-xs
            text-[#557564]
          "
        >
          {subtitle}
        </div>
      )}

    </div>
  );
}