"use client";

import {
  useState,
} from "react";

import {
  getLangFromClient,
  setLangClient,
  t,
  type Lang,
} from "@/app/lib/i18n";

import {
  createBrowserClient,
} from "@/app/lib/supabase-browser";

/* =========================================================
   TYPES
========================================================= */

type Periodo =
  | "mensal"
  | "trimestral"
  | "anual";

/* =========================================================
   SUPABASE
========================================================= */

const supabase =
  createBrowserClient();

/* =========================================================
   COMPONENT
========================================================= */

export default function PlanosClient() {

  const [lang, setLang] =
    useState<Lang>(
      getLangFromClient()
    );

  const [periodo, setPeriodo] =
    useState<Periodo>(
      "mensal"
    );

  const [loadingPlano, setLoadingPlano] =
    useState<string | null>(
      null
    );

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

      setLoadingPlano(
        planoId
      );

      localStorage.setItem(
        "checkout_plano",
        planoId
      );

      localStorage.setItem(
        "checkout_periodo",
        periodo
      );

      const {
        data: { session },
      } =
        await supabase.auth
          .getSession();

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

      console.error(
        "CHECKOUT ERROR:",
        err
      );

      alert(

        lang === "pt"

          ? "Erro ao iniciar checkout."

          : "Error al iniciar checkout."
      );

    } finally {

      setLoadingPlano(
        null
      );
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

      {/* LANGUAGE */}

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

    </div>
  );
}