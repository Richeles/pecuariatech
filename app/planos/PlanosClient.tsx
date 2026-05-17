"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

type Lang = "pt" | "es";

type Periodo =
  | "mensal"
  | "trimestral"
  | "anual";

/* =========================================================
   TEXTOS
========================================================= */

const TEXTS = {
  pt: {
    heroBadge:
      "PecuariaTech Intelligence Layer",

    heroTitle:
      "Planos PecuariaTech",

    heroDescription:
      "Cada plano foi pensado para uma realidade diferente no campo — do controle básico à gestão com IA operacional, CFO Autônomo e inteligência estratégica integrada.",

    tags: [
      "Inteligência Pecuária",
      "CFO Estratégico",
      "IA Operacional",
      "Dominus 360°",
    ],

    mensal: "Mensal",

    trimestral:
      "Trimestral",

    anual: "Anual",

    porMes:
      "por mês",

    porTrimestre:
      "a cada 3 meses",

    porAno:
      "por ano",

    assinar:
      "Assinar",

    destaque:
      "Mais escolhido",

    portugues:
      "🇧🇷 Português",

    espanhol:
      "🇪🇸 Español",
  },

  es: {
    heroBadge:
      "PecuariaTech Intelligence Layer",

    heroTitle:
      "Planes PecuariaTech",

    heroDescription:
      "Cada plan fue diseñado para una realidad diferente en el campo — desde el control básico hasta la gestión con IA operacional, CFO Autónomo e inteligencia estratégica integrada.",

    tags: [
      "Inteligencia Ganadera",
      "CFO Estratégico",
      "IA Operacional",
      "Dominus 360°",
    ],

    mensal:
      "Mensual",

    trimestral:
      "Trimestral",

    anual:
      "Anual",

    porMes:
      "por mes",

    porTrimestre:
      "cada 3 meses",

    porAno:
      "por año",

    assinar:
      "Suscribirse",

    destaque:
      "Más elegido",

    portugues:
      "🇧🇷 Portugués",

    espanhol:
      "🇪🇸 Español",
  },
};

/* =========================================================
   PLANOS
========================================================= */

const PLANOS = {
  pt: [
    {
      id: "basico",

      nome:
        "Básico",

      descricao:
        "Para quem quer sair do caderno, organizar a fazenda e ganhar clareza operacional no dia a dia.",

      mensal: 189.97,

      beneficios: [
        "Dashboard simples e intuitivo",
        "Controle básico de rebanho",
        "Controle essencial de pastagem",
        "Relatório mensal automático",
        "Indicadores operacionais iniciais",
        "Base sólida para começar a gestão digital",
      ],
    },

    {
      id: "profissional",

      nome:
        "Profissional",

      descricao:
        "Para o produtor que já se organiza, mas agora precisa entender os números da operação com mais precisão.",

      mensal: 389.97,

      beneficios: [
        "Tudo do plano Básico",
        "Relatórios mensais avançados",
        "Exportação de dados Excel",
        "Indicadores financeiros iniciais",
        "Planilhas profissionais automatizadas",
        "Alertas operacionais inteligentes",
      ],
    },

    {
      id: "ultra",

      nome:
        "Ultra",

      destaque: true,

      descricao:
        "Para quem quer deixar de reagir aos problemas e começar a tomar decisões com apoio de IA operacional.",

      mensal: 589.97,

      beneficios: [
        "Tudo do plano Profissional",
        "Relatórios premium automatizados",
        "Análises financeiras avançadas",
        "Diagnóstico mensal por IA",
        "Alertas de decisão",
        "Plano mais escolhido por produtores",
      ],
    },

    {
      id: "empresarial",

      nome:
        "Empresarial",

      descricao:
        "Para operações que exigem padronização, gestão integrada e controle em escala.",

      mensal: 789.97,

      beneficios: [
        "Tudo do plano Ultra",
        "Multi-fazendas e multi-usuários",
        "Gestão de equipes",
        "Relatórios personalizados",
        "Alertas automáticos avançados",
      ],
    },

    {
      id: "dominus",

      nome:
        "Premium Dominus 360°",

      descricao:
        "Para quem precisa enxergar a operação como estrutura de capital, gestão estratégica e geração sustentável de valor.",

      mensal: 989.97,

      beneficios: [
        "Tudo do plano Empresarial",
        "CFO Autônomo integrado",
        "IA preditiva e diagnóstica",
        "EBITDA e EBIT automáticos",
        "Valuation e simulações financeiras",
        "Suporte Ultra VIP",
      ],
    },
  ],

  es: [
    {
      id: "basico",

      nome:
        "Básico",

      descricao:
        "Para quienes desean organizar la finca y ganar claridad operacional.",

      mensal: 189.97,

      beneficios: [
        "Dashboard simple e intuitivo",
        "Control básico del rebaño",
        "Control esencial de pasturas",
        "Reporte mensual automático",
        "Indicadores operacionales iniciales",
        "Base sólida para gestión digital",
      ],
    },

    {
      id: "profissional",

      nome:
        "Profesional",

      descricao:
        "Para productores que necesitan comprender los números de la operación con más precisión.",

      mensal: 389.97,

      beneficios: [
        "Todo del plan Básico",
        "Reportes avanzados",
        "Exportación de datos",
        "Indicadores financieros",
        "Automatización profesional",
        "Alertas inteligentes",
      ],
    },

    {
      id: "ultra",

      nome:
        "Ultra",

      destaque: true,

      descricao:
        "Para quienes desean tomar decisiones con apoyo de IA operacional.",

      mensal: 589.97,

      beneficios: [
        "Todo del plan Profesional",
        "Reportes premium",
        "Análisis financieros avanzados",
        "Diagnóstico con IA",
        "Alertas estratégicas",
        "Plan más elegido",
      ],
    },

    {
      id: "empresarial",

      nome:
        "Empresarial",

      descricao:
        "Para operaciones que requieren gestión integrada y control a escala.",

      mensal: 789.97,

      beneficios: [
        "Todo del plan Ultra",
        "Multi-fincas",
        "Gestión de equipos",
        "Reportes personalizados",
        "Alertas avanzadas",
      ],
    },

    {
      id: "dominus",

      nome:
        "Premium Dominus 360°",

      descricao:
        "Para quienes necesitan visión estratégica completa de la operación.",

      mensal: 989.97,

      beneficios: [
        "Todo del plan Empresarial",
        "CFO Autónomo",
        "IA predictiva",
        "EBITDA automático",
        "Valuation financiero",
        "Soporte VIP",
      ],
    },
  ],
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PlanosClient() {

  const router =
    useRouter();

  const [lang, setLang] =
    useState<Lang>("pt");

  const [periodo, setPeriodo] =
    useState<Periodo>("mensal");

  const t =
    TEXTS[lang];

  const planos =
    PLANOS[lang];

  function calcularPreco(
    mensal: number
  ) {

    if (
      periodo === "mensal"
    ) {
      return mensal;
    }

    if (
      periodo === "trimestral"
    ) {
      return mensal * 2.7;
    }

    return mensal * 10;
  }

  function assinar(
    plano: string
  ) {

    router.push(
      `/checkout?plano=${plano}&periodo=${periodo}`
    );
  }

  return (

    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-emerald-50 to-white px-6 py-16">

      {/* LANGUAGE */}

      <div className="absolute right-6 top-6 z-50">

        <div className="flex overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg">

          <button
            onClick={() =>
              setLang("pt")
            }
            className={`px-5 py-3 text-sm font-black transition-all ${
              lang === "pt"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-50"
            }`}
          >
            {t.portugues}
          </button>

          <button
            onClick={() =>
              setLang("es")
            }
            className={`border-l border-emerald-100 px-5 py-3 text-sm font-black transition-all ${
              lang === "es"
                ? "bg-emerald-600 text-white"
                : "text-gray-700 hover:bg-emerald-50"
            }`}
          >
            {t.espanhol}
          </button>

        </div>

      </div>

      {/* HERO */}

      <div className="mx-auto max-w-5xl text-center">

        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-700">
          {t.heroBadge}
        </div>

        <h1 className="mt-8 text-5xl font-black tracking-tight text-gray-950 md:text-7xl">
          {t.heroTitle}
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-gray-600">
          {t.heroDescription}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          {t.tags.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm"
            >
              {item}
            </div>
          ))}

        </div>

        {/* PERIODOS */}

        <div className="mt-14 flex flex-wrap justify-center gap-4">

          <button
            onClick={() =>
              setPeriodo("mensal")
            }
            className={`rounded-2xl px-8 py-4 text-sm font-black transition-all ${
              periodo === "mensal"
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            {t.mensal}
          </button>

          <button
            onClick={() =>
              setPeriodo("trimestral")
            }
            className={`rounded-2xl px-8 py-4 text-sm font-black transition-all ${
              periodo === "trimestral"
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            {t.trimestral}
          </button>

          <button
            onClick={() =>
              setPeriodo("anual")
            }
            className={`rounded-2xl px-8 py-4 text-sm font-black transition-all ${
              periodo === "anual"
                ? "bg-emerald-600 text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            {t.anual}
          </button>

        </div>

      </div>

      {/* GRID PREMIUM */}

      <div className="mx-auto mt-20 grid max-w-[1700px] gap-8 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">

        {planos.map((plano) => {

          const preco =
            calcularPreco(
              plano.mensal
            );

          const inteiro =
            preco.toFixed(2).split(".")[0];

          const decimal =
            preco.toFixed(2).split(".")[1];

          return (

            <div
              key={plano.id}
              className={`relative flex min-h-[980px] h-full flex-col rounded-3xl border bg-white p-10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                plano.destaque
                  ? "border-emerald-400 ring-2 ring-emerald-200"
                  : "border-gray-200"
              }`}
            >

              {plano.destaque && (

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-5 py-2 text-xs font-black uppercase tracking-wide text-white shadow-lg">
                  {t.destaque}
                </div>

              )}

              <div>

                <h3 className="text-2xl font-black text-gray-950">
                  {plano.nome}
                </h3>

                <p className="mt-5 min-h-[190px] text-[15px] leading-9 text-gray-600">
                  {plano.descricao}
                </p>

              </div>

              {/* PREÇO PREMIUM */}

              <div className="mt-10 min-h-[120px]">

                <div className="flex items-end justify-start whitespace-nowrap">

                  <span className="mr-1 mb-[7px] text-[16px] font-black text-emerald-600">
                    R$
                  </span>

                  <span className="text-[42px] font-black leading-none tracking-tight text-emerald-600">
                    {inteiro}
                  </span>

                  <span className="mb-[5px] ml-1 text-[20px] font-black leading-none text-emerald-600">
                    ,{decimal}
                  </span>

                </div>

                <div className="mt-3 text-sm font-semibold text-gray-500">

                  {periodo === "mensal" &&
                    t.porMes}

                  {periodo === "trimestral" &&
                    t.porTrimestre}

                  {periodo === "anual" &&
                    t.porAno}

                </div>

              </div>

              {/* BENEFICIOS */}

              <div className="mt-10 flex-1 space-y-4">

                {plano.beneficios.map(
                  (beneficio) => (

                    <div
                      key={beneficio}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >

                      <div className="mt-1 text-emerald-600">
                        ✓
                      </div>

                      <div>
                        {beneficio}
                      </div>

                    </div>

                  )
                )}

              </div>

              {/* BUTTON */}

              <button
                onClick={() =>
                  assinar(
                    plano.id
                  )
                }
                className={`mt-10 rounded-2xl px-6 py-4 text-sm font-black transition-all ${
                  plano.destaque
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-gray-950 text-white hover:bg-black"
                }`}
              >
                {t.assinar}
              </button>

            </div>

          );
        })}

      </div>

    </div>
  );
}