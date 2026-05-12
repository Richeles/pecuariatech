"use client";

import { useState } from "react";

import {
  getLangFromClient,
  setLangClient,
  t,
  type Lang,
} from "@/app/lib/i18n";

import { createClient } from "@/app/lib/supabase-browser";

type Periodo =
  | "mensal"
  | "trimestral"
  | "anual";

export default function PlanosClient() {

  const [lang, setLang] =
    useState<Lang>(
      getLangFromClient()
    );

  const [periodo, setPeriodo] =
    useState<Periodo>("mensal");

  const [loadingPlano, setLoadingPlano] =
    useState<string | null>(null);

  /* =====================================================
     PREÇOS
  ===================================================== */

  function calcularPreco(
    valorMensal: number,
    periodo: Periodo
  ) {

    if (periodo === "mensal") {
      return valorMensal;
    }

    if (periodo === "trimestral") {
      return valorMensal * 3 * 0.95;
    }

    if (periodo === "anual") {
      return valorMensal * 12 * 0.8;
    }

    return valorMensal;
  }

  /* =====================================================
     PLANOS
  ===================================================== */

  const planos = [

    {
      id: "basico",

      nome:
        lang === "pt"
          ? "Básico"
          : "Básico",

      descricao:
        lang === "pt"
          ? "Para quem deseja iniciar uma gestão moderna e organizada da fazenda."
          : "Para quienes desean iniciar una gestión moderna y organizada.",

      mensal: 149.9,

      features: [

        lang === "pt"
          ? "Dashboard operacional"
          : "Dashboard operacional",

        lang === "pt"
          ? "Controle de rebanho"
          : "Control de ganado",

        lang === "pt"
          ? "Controle de pastagem"
          : "Control de pastura",

        lang === "pt"
          ? "Indicadores iniciais"
          : "Indicadores iniciales",

        lang === "pt"
          ? "Relatórios automáticos"
          : "Reportes automáticos",

        lang === "pt"
          ? "Base digital sólida"
          : "Base digital sólida",
      ],
    },

    {
      id: "profissional",

      nome:
        lang === "pt"
          ? "Profissional"
          : "Profesional",

      descricao:
        lang === "pt"
          ? "Para produtores que precisam compreender margem, custo e eficiência."
          : "Para productores que necesitan entender margen y eficiencia.",

      mensal: 247.9,

      features: [

        lang === "pt"
          ? "Relatórios avançados"
          : "Reportes avanzados",

        lang === "pt"
          ? "Exportação Excel"
          : "Exportación Excel",

        lang === "pt"
          ? "Indicadores financeiros"
          : "Indicadores financieros",

        lang === "pt"
          ? "Alertas inteligentes"
          : "Alertas inteligentes",

        lang === "pt"
          ? "Automação operacional"
          : "Automatización operacional",

        lang === "pt"
          ? "Tudo do plano Básico"
          : "Todo del plan Básico",
      ],
    },

    {
      id: "ultra",

      destaque: true,

      nome: "Ultra IA",

      descricao:
        lang === "pt"
          ? "IA operacional aplicada à tomada de decisão agrofinanceira."
          : "IA operacional aplicada a decisiones agrofinancieras.",

      mensal: 452.9,

      features: [

        lang === "pt"
          ? "IA operacional integrada"
          : "IA operacional integrada",

        lang === "pt"
          ? "Diagnóstico financeiro"
          : "Diagnóstico financiero",

        lang === "pt"
          ? "Relatórios premium"
          : "Reportes premium",

        lang === "pt"
          ? "Alertas inteligentes"
          : "Alertas inteligentes",

        lang === "pt"
          ? "Análises avançadas"
          : "Análisis avanzados",

        lang === "pt"
          ? "Plano mais escolhido"
          : "Plan más elegido",
      ],
    },

    {
      id: "empresarial",

      nome:
        lang === "pt"
          ? "Empresarial"
          : "Empresarial",

      descricao:
        lang === "pt"
          ? "Escala, governança e controle para grandes operações."
          : "Escala, gobernanza y control para grandes operaciones.",

      mensal: 627.9,

      features: [

        lang === "pt"
          ? "Multi-fazendas"
          : "Multi-fincas",

        lang === "pt"
          ? "Multi-usuários"
          : "Multiusuarios",

        lang === "pt"
          ? "Gestão de equipes"
          : "Gestión de equipos",

        lang === "pt"
          ? "Relatórios personalizados"
          : "Reportes personalizados",

        lang === "pt"
          ? "Infraestrutura corporativa"
          : "Infraestructura corporativa",
      ],
    },

    {
      id: "premium_dominus",

      nome:
        "Premium Dominus 360°",

      descricao:
        lang === "pt"
          ? "Infraestrutura estratégica para produtores, grupos e investidores."
          : "Infraestructura estratégica para productores e inversionistas.",

      mensal: 789.9,

      features: [

        lang === "pt"
          ? "CFO Ultra integrado"
          : "CFO Ultra integrado",

        lang === "pt"
          ? "IA preditiva"
          : "IA predictiva",

        lang === "pt"
          ? "EBITDA automático"
          : "EBITDA automático",

        "Valuation",

        lang === "pt"
          ? "Simulações financeiras"
          : "Simulaciones financieras",

        lang === "pt"
          ? "Suporte executivo VIP"
          : "Soporte ejecutivo VIP",
      ],
    },
  ];

  /* =====================================================
     CHECKOUT
  ===================================================== */

  async function handleCheckout(
    planoId: string
  ) {

    try {

      setLoadingPlano(planoId);

      localStorage.setItem(
        "checkout_plano",
        planoId
      );

      localStorage.setItem(
        "checkout_periodo",
        periodo
      );

      const supabase =
        createClient();

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      /* ==========================================
         SEM LOGIN
      ========================================== */

      if (!session) {

        window.location.href =
          `/cadastro?plano=${planoId}&periodo=${periodo}`;

        return;
      }

      /* ==========================================
         COM LOGIN
      ========================================== */

      window.location.href =
        `/checkout?plano=${planoId}&periodo=${periodo}`;

    } catch (err) {

      console.error(err);

      alert(
        lang === "pt"
          ? "Erro ao iniciar checkout."
          : "Error al iniciar checkout."
      );

    } finally {

      setLoadingPlano(null);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        relative
        -mt-4
        md:-mt-10
        pb-16
        md:pb-24
      "
    >

      {/* =====================================
          LANGUAGE
      ===================================== */}

      <div
        className="
          mb-8
          flex
          justify-center
          md:justify-end
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-neutral-200
            bg-white/90
            p-1.5
            shadow-sm
            backdrop-blur
          "
        >

          <button
            type="button"
            onClick={() => {

              setLang("pt");

              setLangClient("pt");
            }}
            className={`
              rounded-full
              px-4
              py-2
              text-xs
              font-black
              transition-all
              ${
                lang === "pt"
                  ? "bg-green-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }
            `}
          >
            🇧🇷 PT
          </button>

          <button
            type="button"
            onClick={() => {

              setLang("es");

              setLangClient("es");
            }}
            className={`
              rounded-full
              px-4
              py-2
              text-xs
              font-black
              transition-all
              ${
                lang === "es"
                  ? "bg-green-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }
            `}
          >
            🇪🇸 ES
          </button>

        </div>

      </div>

      {/* =====================================
          PERIODOS
      ===================================== */}

      <div
        className="
          mb-10
          flex
          justify-center
          gap-3
          flex-wrap
        "
      >

        {(
          [
            "mensal",
            "trimestral",
            "anual",
          ] as Periodo[]
        ).map((p) => (

          <button
            key={p}
            type="button"
            onClick={() =>
              setPeriodo(p)
            }
            className={`
              rounded-2xl
              px-6
              py-3
              text-xs
              font-black
              uppercase
              tracking-wide
              transition-all
              ${
                periodo === p
                  ? "bg-green-600 text-white shadow-xl"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }
            `}
          >
            {t(lang, p)}
          </button>
        ))}
      </div>

      {/* =====================================
          GRID
      ===================================== */}

      <div
        className="
          mx-auto
          grid
          max-w-7xl
          grid-cols-1
          gap-5
          md:grid-cols-2
          xl:grid-cols-5
        "
      >

        {planos.map((plano) => {

          const preco =
            calcularPreco(
              plano.mensal,
              periodo
            );

          return (

            <div
              key={plano.id}
              className={`
                relative
                overflow-hidden
                rounded-[28px]
                border
                bg-white/95
                p-7
                shadow-sm
                backdrop-blur
                transition-all
                duration-500
                hover:-translate-y-2
                hover:shadow-2xl
                ${
                  plano.destaque
                    ? "border-green-600 scale-[1.01]"
                    : "border-neutral-200"
                }
              `}
            >

              {plano.destaque && (

                <div
                  className="
                    absolute
                    right-4
                    top-4
                    rounded-full
                    bg-green-600
                    px-3
                    py-1
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-white
                  "
                >
                  Ultra IA
                </div>
              )}

              <h3
                className="
                  text-2xl
                  font-black
                  text-neutral-900
                "
              >
                {plano.nome}
              </h3>

              <p
                className="
                  mt-3
                  min-h-[72px]
                  text-sm
                  leading-6
                  text-neutral-500
                "
              >
                {plano.descricao}
              </p>

              <div className="mt-7">

                <div
                  className="
                    text-5xl
                    font-black
                    tracking-tight
                    text-green-600
                  "
                >
                  R$ {preco.toFixed(2)}
                </div>

                <span
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-neutral-400
                  "
                >
                  /{t(lang, periodo)}
                </span>

              </div>

              <ul
                className="
                  mt-7
                  space-y-3
                  text-sm
                  text-neutral-700
                "
              >

                {plano.features.map(
                  (feature, i) => (

                    <li
                      key={i}
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >
                      <span className="text-green-600">
                        ✓
                      </span>

                      <span>
                        {feature}
                      </span>

                    </li>
                  )
                )}

              </ul>

              <button
                onClick={() =>
                  handleCheckout(
                    plano.id
                  )
                }
                disabled={
                  loadingPlano ===
                  plano.id
                }
                className="
                  mt-8
                  w-full
                  rounded-2xl
                  bg-green-600
                  py-3.5
                  text-sm
                  font-black
                  uppercase
                  tracking-wide
                  text-white
                  transition-all
                  duration-300
                  hover:bg-green-700
                  hover:shadow-xl
                  disabled:opacity-70
                "
              >

                {loadingPlano ===
                plano.id

                  ? t(
                      lang,
                      "processando"
                    )

                  : t(
                      lang,
                      "assinar"
                    )}

              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}