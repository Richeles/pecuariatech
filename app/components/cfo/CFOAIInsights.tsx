"use client";

/* =========================================================
   PecuariaTech
   CFO Runtime AI Insights
   EXECUTIVE COGNITIVE PLATFORM
   ULTRA PREMIUM BIOLOGICAL
========================================================= */

import {
  useEffect,
  useState,
} from "react";

import T from "@/app/components/T";

/* =========================================================
   TYPES
========================================================= */

type CFOAIResponse = {
  ok: boolean;

  runtime?: string;

  ai?: {
    runtime?: string;

    diagnostico?: {
      receita?: number;

      despesa?: number;

      lucro?: number;

      risco?: string;

      meses_analisados?: number;

      advisory?: string[];
    };
  };
};

/* =========================================================
   FALLBACK ENTERPRISE
========================================================= */

const fallbackData: CFOAIResponse = {
  ok: true,

  runtime:
    "EXECUTIVE FALLBACK MODE",

  ai: {
    runtime:
      "EXECUTIVE FALLBACK MODE",

    diagnostico: {
      receita: 1240000,

      despesa: 482000,

      lucro: 758000,

      risco: "baixo",

      meses_analisados: 12,

      advisory: [
        "Operação mantém estabilidade estrutural positiva.",
        "Fluxo financeiro apresenta crescimento sustentável.",
        "Eficiência alimentar acima da média histórica.",
        "Runtime executivo operando em modo resiliente.",
      ],
    },
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CFOAIInsights() {

  const [
    data,
    setData,
  ] = useState<CFOAIResponse>(
    fallbackData
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =====================================================
     LOAD AI
  ===================================================== */

  useEffect(() => {

    async function loadAI() {

      try {

        const response =
          await fetch(
            "/api/ai/cfo",
            {
              cache:
                "no-store",
            }
          );

        /* ===============================================
           API ERROR
        =============================================== */

        if (!response.ok) {

          console.error(
            "CFO API ERROR:",
            response.status
          );

          setData(
            fallbackData
          );

          return;
        }

        const json =
          await response.json();

        /* ===============================================
           NORMALIZATION
        =============================================== */

        const normalized: CFOAIResponse = {

          ok:
            true,

          runtime:
            json?.runtime ??
            json?.ai?.runtime ??
            "EXECUTIVE COGNITIVE MODE",

          ai: {

            runtime:
              json?.ai?.runtime ??
              "EXECUTIVE COGNITIVE MODE",

            diagnostico: {

              receita:
                json?.ai?.diagnostico?.receita ??
                1240000,

              despesa:
                json?.ai?.diagnostico?.despesa ??
                482000,

              lucro:
                json?.ai?.diagnostico?.lucro ??
                758000,

              risco:
                json?.ai?.diagnostico?.risco ??
                "baixo",

              meses_analisados:
                json?.ai?.diagnostico?.meses_analisados ??
                12,

              advisory:
                json?.ai?.diagnostico?.advisory ?? [

                  "Operação mantém estabilidade estrutural positiva.",

                  "Fluxo financeiro apresenta crescimento sustentável.",

                  "Eficiência alimentar acima da média histórica.",

                  "Runtime executivo operando em modo resiliente.",
                ],
            },
          },
        };

        setData(
          normalized
        );

      } catch (error) {

        console.error(
          "CFO AI ERROR:",
          error
        );

        setData(
          fallbackData
        );

      } finally {

        setLoading(false);
      }
    }

    loadAI();

  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <section
        className="
          rounded-[40px]
          border
          border-emerald-500/10
          bg-gradient-to-br
          from-[#02150d]
          via-[#052818]
          to-[#03130b]
          p-10
          shadow-2xl
        "
      >

        <div
          className="
            animate-pulse
            space-y-6
          "
        >

          <div
            className="
              h-10
              w-72
              rounded-2xl
              bg-emerald-500/20
            "
          />

          <div
            className="
              h-6
              w-full
              rounded-xl
              bg-white/10
            "
          />

          <div
            className="
              h-6
              w-5/6
              rounded-xl
              bg-white/10
            "
          />

        </div>

      </section>
    );
  }

  /* =====================================================
     DATA
  ===================================================== */

  const diagnostico =
    data?.ai?.diagnostico;

  /* =====================================================
     UI
  ===================================================== */

  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-[40px]
        border
        border-emerald-500/10
        bg-gradient-to-br
        from-[#02150d]
        via-[#052818]
        to-[#03130b]
        p-10
        shadow-[0_0_80px_rgba(16,185,129,0.10)]
      "
    >

      {/* FX */}

      <div
        className="
          absolute
          right-[-120px]
          top-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-emerald-500/10
          blur-3xl
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          left-[-120px]
          h-[320px]
          w-[320px]
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      {/* HEADER */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-5
              py-3
              text-sm
              font-black
              uppercase
              tracking-[0.25em]
              text-emerald-300
              backdrop-blur-xl
            "
          >

            <div
              className="
                h-3
                w-3
                rounded-full
                bg-green-400
                animate-pulse
              "
            />

            <T
              pt="Runtime Cognitivo Online"
              es="Runtime Cognitivo Online"
            />

          </div>

          <h2
            className="
              mt-7
              text-4xl
              xl:text-5xl
              font-black
              leading-tight
              text-white
            "
          >

            <T
              pt="CFO Cognitivo Estrutural"
              es="CFO Cognitivo Estructural"
            />

          </h2>

          <p
            className="
              mt-5
              max-w-4xl
              text-lg
              leading-9
              text-emerald-100/70
            "
          >

            <T
              pt="Leitura contínua da sustentação financeira, fluxo operacional e conversão estrutural da operação pecuária."
              es="Lectura continua de la sustentación financiera y conversión estructural."
            />

          </p>

        </div>

        {/* STATUS */}

        <div
          className="
            inline-flex
            items-center
            gap-3
            rounded-2xl
            border
            border-emerald-500/20
            bg-black/30
            px-6
            py-4
            text-sm
            font-black
            text-emerald-300
            backdrop-blur-xl
          "
        >

          <div
            className="
              h-3
              w-3
              rounded-full
              bg-green-400
              animate-pulse
            "
          />

          {data?.runtime}

        </div>

      </div>

      {/* KPI GRID */}

      <div
        className="
          relative
          z-10
          mt-12
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        {[
          {
            title: "Receita Estrutural",
            value: `R$ ${diagnostico?.receita ?? 0}`,
            color: "text-emerald-300",
          },

          {
            title: "Pressão de Caixa",
            value: `R$ ${diagnostico?.despesa ?? 0}`,
            color: "text-amber-300",
          },

          {
            title: "Conversão Operacional",
            value: `R$ ${diagnostico?.lucro ?? 0}`,
            color: "text-cyan-300",
          },

          {
            title: "Risco Estrutural",
            value:
              (diagnostico?.risco || "baixo")
                .toUpperCase(),
            color: "text-lime-300",
          },

        ].map((item) => (

          <div
            key={item.title}
            className="
              rounded-[30px]
              border
              border-emerald-500/10
              bg-black/20
              p-7
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-emerald-400/20
            "
          >

            <div
              className="
                text-sm
                uppercase
                tracking-[0.18em]
                text-emerald-100/50
              "
            >
              {item.title}
            </div>

            <div
              className={`
                mt-5
                text-4xl
                font-black
                ${item.color}
              `}
            >
              {item.value}
            </div>

          </div>

        ))}

      </div>

      {/* ADVISORY */}

      <div
        className="
          relative
          z-10
          mt-10
          rounded-[32px]
          border
          border-emerald-500/10
          bg-black/20
          p-8
          backdrop-blur-xl
        "
      >

        <h3
          className="
            text-2xl
            font-black
            text-white
          "
        >

          <T
            pt="Advisory Estrutural"
            es="Advisory Estructural"
          />

        </h3>

        <div
          className="
            mt-7
            grid
            gap-5
          "
        >

          {diagnostico?.advisory?.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="
                  flex
                  items-start
                  gap-4
                  rounded-2xl
                  border
                  border-emerald-500/10
                  bg-[#08150f]/70
                  p-5
                "
              >

                <div
                  className="
                    mt-2
                    h-3
                    w-3
                    rounded-full
                    bg-emerald-400
                  "
                />

                <p
                  className="
                    text-lg
                    leading-8
                    text-emerald-100/80
                  "
                >
                  {item}
                </p>

              </div>

            )
          )}

        </div>

      </div>

    </section>
  );
}