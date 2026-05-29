"use client";

import { useState } from "react";
import {
  useRouter,
  usePathname,
} from "next/navigation";

import LanguageSwitcher
from "@/app/components/i18n/LanguageSwitcher";

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
  },

  es: {
    heroBadge:
      "PecuariaTech Intelligence Layer",

    heroTitle:
      "Planes PecuariaTech",

    heroDescription:
      "Cada plan fue diseñado para una realidad diferente en el campo.",

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
  },
};

/* =========================================================
   PLANOS
========================================================= */

const PLANOS = {
  pt: [
    {
      id: "basico",
      nome: "Básico",
      descricao:
        "Para quem quer sair do caderno, organizar a fazenda e ganhar clareza operacional no dia a dia.",
      mensal: 189.97,
      beneficios: [
        "Dashboard simples e intuitivo",
        "Controle básico de rebanho",
        "Controle essencial de pastagem",
        "Relatório mensal automático",
      ],
    },

    {
      id: "profissional",
      nome: "Profissional",
      descricao:
        "Para produtores que precisam compreender os números da operação com maior precisão.",
      mensal: 389.97,
      beneficios: [
        "Relatórios avançados",
        "Exportação Excel",
        "Indicadores financeiros",
        "Alertas inteligentes",
      ],
    },

    {
      id: "ultra",
      nome: "Ultra",
      destaque: true,
      descricao:
        "Tomada de decisão com IA operacional e inteligência pecuária avançada.",
      mensal: 589.97,
      beneficios: [
        "IA operacional",
        "Análises avançadas",
        "Alertas estratégicos",
        "Motor analítico",
      ],
    },

    {
      id: "empresarial",
      nome: "Empresarial",
      descricao:
        "Gestão integrada para operações com múltiplas fazendas e equipes.",
      mensal: 789.97,
      beneficios: [
        "Gestão de equipes",
        "Governança operacional",
        "Relatórios personalizados",
        "Multioperações",
      ],
    },

    {
      id: "dominus",
      nome: "Dominus 360°",
      descricao:
        "Camada executiva premium com CFO Autônomo e inteligência financeira.",
      mensal: 989.97,
      beneficios: [
        "CFO Autônomo",
        "IA preditiva",
        "Valuation financeiro",
        "Suporte prioritário",
      ],
    },
  ],

  es: [],
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PlanosClient() {

  const router =
    useRouter();

  const pathname =
    usePathname();

  const lang: Lang =
    pathname.startsWith("/es")
      ? "es"
      : "pt";

  const [periodo, setPeriodo] =
    useState<Periodo>("mensal");

  const t =
    TEXTS[lang as keyof typeof TEXTS];

  const planos =
    PLANOS[lang as keyof typeof PLANOS]?.length
      ? PLANOS[lang as keyof typeof PLANOS]
      : PLANOS.pt;

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

    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-gradient-to-br
        from-[#06110b]
        via-[#0c1f16]
        to-[#163328]
        px-6
        py-20
      "
    >

      {/* LANGUAGE SWITCHER */}

      <div
        className="
          absolute
          top-8
          right-8
          z-50
        "
      >
        <LanguageSwitcher />
      </div>

      {/* OVERLAY PREMIUM */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_45%)]
          pointer-events-none
        "
      />

      {/* HERO */}

      <div className="relative z-10 mx-auto max-w-[1600px] text-center">

        <div
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-6
            py-3
            text-xs
            font-black
            uppercase
            tracking-[0.24em]
            text-emerald-200
            backdrop-blur-sm
          "
        >
          {t.heroBadge}
        </div>

        <h1
          className="
            mt-8
            text-5xl
            font-black
            tracking-tight
            text-white
            xl:text-7xl
          "
        >
          {t.heroTitle}
        </h1>

        <p
          className="
            mx-auto
            mt-8
            max-w-5xl
            text-lg
            leading-8
            text-emerald-100/80
            xl:text-xl
          "
        >
          {t.heroDescription}
        </p>

        {/* PERIODOS */}

        <div
          className="
            mt-12
            flex
            flex-wrap
            items-center
            justify-center
            gap-4
          "
        >

          <button
            onClick={() =>
              setPeriodo("mensal")
            }
            className={`
              rounded-2xl
              px-8
              py-4
              text-sm
              font-black
              transition-all
              ${
                periodo === "mensal"
                  ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                  : "border border-emerald-900 bg-[#052e24]/80 text-emerald-100 hover:bg-[#08382d]"
              }
            `}
          >
            {t.mensal}
          </button>

          <button
            onClick={() =>
              setPeriodo("trimestral")
            }
            className={`
              rounded-2xl
              px-8
              py-4
              text-sm
              font-black
              transition-all
              ${
                periodo === "trimestral"
                  ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                  : "border border-emerald-900 bg-[#052e24]/80 text-emerald-100 hover:bg-[#08382d]"
              }
            `}
          >
            {t.trimestral}
          </button>

          <button
            onClick={() =>
              setPeriodo("anual")
            }
            className={`
              rounded-2xl
              px-8
              py-4
              text-sm
              font-black
              transition-all
              ${
                periodo === "anual"
                  ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                  : "border border-emerald-900 bg-[#052e24]/80 text-emerald-100 hover:bg-[#08382d]"
              }
            `}
          >
            {t.anual}
          </button>

        </div>

      </div>

      {/* GRID */}

      <div
        className="
          relative
          z-10
          mx-auto
          mt-20
          grid
          max-w-[2100px]
          gap-8
          xl:grid-cols-5
        "
      >

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
              className={`
                relative
                flex
                min-h-[680px]
                flex-col
                rounded-[34px]
                border
                bg-[#10241b]/95
                p-8
                backdrop-blur-md
                shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-[0_35px_90px_rgba(0,0,0,0.55)]
                ${
                  plano.destaque
                    ? "border-emerald-400 ring-2 ring-emerald-300/30"
                    : "border-emerald-900/40"
                }
              `}
            >

              {plano.destaque && (

                <div
                  className="
                    absolute
                    -top-5
                    left-1/2
                    -translate-x-1/2
                    rounded-full
                    bg-emerald-600
                    px-6
                    py-3
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-white
                    shadow-xl
                  "
                >
                  {t.destaque}
                </div>

              )}

              <h3
                className="
                  text-[34px]
                  font-black
                  leading-tight
                  text-white
                "
              >
                {plano.nome}
              </h3>

              <p
                className="
                  mt-5
                  min-h-[100px]
                  text-[15px]
                  leading-7
                  text-emerald-100/75
                "
              >
                {plano.descricao}
              </p>

              {/* PREÇO */}

              <div className="mt-8">

                <div className="flex items-end">

                  <span
                    className="
                      mr-2
                      mb-2
                      text-lg
                      font-black
                      text-emerald-400
                    "
                  >
                    R$
                  </span>

                  <span
                    className="
                      text-[58px]
                      font-black
                      leading-none
                      tracking-[-0.06em]
                      text-emerald-400
                    "
                  >
                    {inteiro}
                  </span>

                  <span
                    className="
                      mb-2
                      ml-1
                      text-[24px]
                      font-black
                      text-emerald-400
                    "
                  >
                    ,{decimal}
                  </span>

                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    font-bold
                    text-emerald-100/50
                  "
                >

                  {periodo === "mensal" &&
                    t.porMes}

                  {periodo === "trimestral" &&
                    t.porTrimestre}

                  {periodo === "anual" &&
                    t.porAno}

                </div>

              </div>

              {/* BENEFICIOS */}

              <div
                className="
                  mt-8
                  flex-1
                  space-y-4
                "
              >

                {plano.beneficios.map(
                  (beneficio) => (

                    <div
                      key={beneficio}
                      className="
                        flex
                        items-start
                        gap-3
                        text-[14px]
                        leading-6
                        text-emerald-100/80
                      "
                    >

                      <div
                        className="
                          mt-1
                          font-black
                          text-emerald-400
                        "
                      >
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
                className={`
                  mt-8
                  rounded-[22px]
                  px-6
                  py-5
                  text-sm
                  font-black
                  transition-all
                  ${
                    plano.destaque
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-[#1d3b2d] text-white hover:bg-[#28543f]"
                  }
                `}
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