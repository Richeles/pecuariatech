"use client";

/* =========================================================
   PecuariaTech
   CFO Runtime AI Insights
   Runtime Cognitivo Financeiro
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
   COMPONENT
========================================================= */

export default function CFOAIInsights() {

  const [
    data,
    setData,
  ] = useState<CFOAIResponse | null>(null);

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

        const json =
          await response.json();

        setData(json);

      } catch (error) {

        console.error(
          "CFO AI ERROR:",
          error
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
          rounded-[32px]
          border
          border-emerald-100
          bg-white
          p-8
          shadow-sm
        "
      >

        <div
          className="
            animate-pulse
            space-y-4
          "
        >

          <div
            className="
              h-8
              w-64
              rounded-xl
              bg-gray-200
            "
          />

          <div
            className="
              h-5
              w-full
              rounded-xl
              bg-gray-100
            "
          />

          <div
            className="
              h-5
              w-5/6
              rounded-xl
              bg-gray-100
            "
          />

        </div>

      </section>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (!data?.ok) {

    return (

      <section
        className="
          rounded-[32px]
          border
          border-red-200
          bg-red-50
          p-8
          shadow-sm
        "
      >

        <h3
          className="
            text-2xl
            font-black
            text-red-700
          "
        >

          <T
            pt="Erro no Runtime Cognitivo"
            es="Error en Runtime Cognitivo"
          />

        </h3>

        <p
          className="
            mt-4
            text-red-600
          "
        >

          <T
            pt="Não foi possível carregar a inteligência financeira."
            es="No fue posible cargar la inteligencia financiera."
          />

        </p>

      </section>
    );
  }

  /* =====================================================
     DATA
  ===================================================== */

  const diagnostico =
    data.ai?.diagnostico;

  /* =====================================================
     UI
  ===================================================== */

  return (

    <section
      className="
        overflow-hidden
        rounded-[36px]
        border
        border-emerald-900/20
        bg-gradient-to-br
        from-[#04160e]
        via-[#052818]
        to-[#03130b]
        p-10
        shadow-2xl
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
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
              rounded-full
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-4
              py-2
              text-sm
              font-bold
              text-emerald-300
            "
          >

            <T
              pt="Runtime Cognitivo Online"
              es="Runtime Cognitivo Online"
            />

          </div>

          <h2
            className="
              mt-6
              text-4xl
              font-black
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
              mt-4
              max-w-4xl
              text-lg
              leading-9
              text-emerald-100/70
            "
          >

            <T
              pt="Leitura estrutural contínua da operação financeira e da sustentação de capital."
              es="Lectura estructural continua de la operación financiera y sostenibilidad del capital."
            />

          </p>

        </div>

        <div
          className="
            inline-flex
            items-center
            gap-3
            rounded-2xl
            border
            border-emerald-500/20
            bg-[#0b1811]/70
            px-6
            py-4
            text-sm
            font-bold
            text-emerald-300
          "
        >

          <div
            className="
              h-3
              w-3
              rounded-full
              bg-green-400
            "
          />

          {data.runtime}

        </div>

      </div>

      {/* =================================================
          GRID
      ================================================= */}

      <div
        className="
          mt-10
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* RECEITA */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-500/20
            bg-[#0a2117]/80
            p-7
          "
        >

          <div
            className="
              text-sm
              text-emerald-100/50
            "
          >

            <T
              pt="Receita Estrutural"
              es="Ingresos Estructurales"
            />

          </div>

          <div
            className="
              mt-4
              text-4xl
              font-black
              text-white
            "
          >

            R$ {diagnostico?.receita ?? 0}

          </div>

        </div>

        {/* DESPESA */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-500/20
            bg-[#0a2117]/80
            p-7
          "
        >

          <div
            className="
              text-sm
              text-emerald-100/50
            "
          >

            <T
              pt="Pressão de Caixa"
              es="Presión de Caja"
            />

          </div>

          <div
            className="
              mt-4
              text-4xl
              font-black
              text-white
            "
          >

            R$ {diagnostico?.despesa ?? 0}

          </div>

        </div>

        {/* LUCRO */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-500/20
            bg-[#0a2117]/80
            p-7
          "
        >

          <div
            className="
              text-sm
              text-emerald-100/50
            "
          >

            <T
              pt="Conversão Operacional"
              es="Conversión Operacional"
            />

          </div>

          <div
            className="
              mt-4
              text-4xl
              font-black
              text-white
            "
          >

            R$ {diagnostico?.lucro ?? 0}

          </div>

        </div>

        {/* RISCO */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-500/20
            bg-[#0a2117]/80
            p-7
          "
        >

          <div
            className="
              text-sm
              text-emerald-100/50
            "
          >

            <T
              pt="Risco Estrutural"
              es="Riesgo Estructural"
            />

          </div>

          <div
            className="
              mt-4
              text-4xl
              font-black
              text-white
            "
          >

            {(diagnostico?.risco || "baixo")
              .toUpperCase()}

          </div>

        </div>

      </div>

      {/* =================================================
          ADVISORY
      ================================================= */}

      <div
        className="
          mt-10
          rounded-[32px]
          border
          border-emerald-500/20
          bg-[#081b12]/80
          p-8
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
            mt-6
            grid
            gap-4
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
                  bg-[#0b1811]/60
                  p-5
                "
              >

                <div
                  className="
                    mt-1
                    h-3
                    w-3
                    rounded-full
                    bg-emerald-400
                  "
                />

                <p
                  className="
                    text-emerald-100/80
                    leading-8
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