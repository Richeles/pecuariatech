"use client";

import {
  useEffect,
  useState,
} from "react";

import Paywall from "../components/Paywall";

type NivelPlano =
  | "basico"
  | "profissional"
  | "ultra"
  | "empresarial"
  | "premium";

export default function UltraBiologicaPage() {

  /* =====================================================
     STATES
  ===================================================== */

  const [
    nivel,
    setNivel,
  ] =
    useState<
      NivelPlano | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {

    async function verificarPlano() {

      try {

        const token =
          localStorage.getItem(
            "sb-access-token"
          );

        /* ==========================================
           REGRA Z
        ========================================== */

        if (!token) {

          setNivel(
            "basico"
          );

          return;
        }

        /* ==========================================
           FETCH
        ========================================== */

        const resp =
          await fetch(
            "/api/assinatura",
            {

              method: "GET",

              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        /* ==========================================
           FAIL SAFE
        ========================================== */

        if (!resp.ok) {

          setNivel(
            "basico"
          );

          return;
        }

        const json =
          await resp.json();

        setNivel(
          json?.nivel ??
          "basico"
        );

      } catch (
        error
      ) {

        console.error(
          "[ULTRA_BIOLOGICA]",
          error
        );

        setNivel(
          "basico"
        );

      } finally {

        setLoading(
          false
        );
      }
    }

    verificarPlano();

  }, []);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div
        className="
          flex
          min-h-[300px]
          items-center
          justify-center
          text-sm
          text-neutral-500
        "
      >
        Carregando...
      </div>
    );
  }

  /* =====================================================
     PAYWALL
  ===================================================== */

  if (
    !nivel ||

    ![
      "ultra",
      "empresarial",
      "premium",
    ].includes(
      nivel
    )
  ) {

    return <Paywall />;
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-white
        via-emerald-50
        to-green-100
        p-6
      "
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <div
        className="
          mb-10
        "
      >

        <div
          className="
            inline-flex
            rounded-full
            border
            border-emerald-300
            bg-white/80
            px-4
            py-2
            text-[11px]
            font-black
            uppercase
            tracking-[0.2em]
            text-emerald-700
            shadow-sm
          "
        >
          UltraBiológica Governance Layer
        </div>

        <h1
          className="
            mt-5
            text-4xl
            font-black
            tracking-tight
            text-emerald-900
          "
        >
          UltraBiológica 360°
        </h1>

        <p
          className="
            mt-4
            max-w-3xl
            text-base
            leading-8
            text-emerald-900/75
          "
        >
          Diagnóstico avançado
          de eficiência biológica,
          inteligência zootécnica
          e performance operacional
          do rebanho em ambiente
          corporativo premium.
        </p>

      </div>

      {/* =====================================
          GRID
      ===================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          md:grid-cols-3
        "
      >

        {/* CARD 1 */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-200
            bg-white/90
            p-6
            shadow-xl
            backdrop-blur-xl
          "
        >

          <div
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-emerald-700
            "
          >
            Índice de Performance
          </div>

          <div
            className="
              mt-4
              text-5xl
              font-black
              text-emerald-900
            "
          >
            92
          </div>

          <p
            className="
              mt-3
              text-sm
              text-neutral-600
            "
          >
            Score operacional
            consolidado via
            análise integrada
            de manejo,
            sanidade,
            ganho e eficiência.
          </p>

        </div>

        {/* CARD 2 */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-200
            bg-white/90
            p-6
            shadow-xl
            backdrop-blur-xl
          "
        >

          <div
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-emerald-700
            "
          >
            Eficiência Nutricional
          </div>

          <div
            className="
              mt-4
              text-3xl
              font-black
              text-emerald-900
            "
          >
            Alta
          </div>

          <p
            className="
              mt-3
              text-sm
              text-neutral-600
            "
          >
            Conversão alimentar
            otimizada com análise
            combinada de consumo,
            pastagem e desempenho.
          </p>

        </div>

        {/* CARD 3 */}

        <div
          className="
            rounded-3xl
            border
            border-emerald-200
            bg-white/90
            p-6
            shadow-xl
            backdrop-blur-xl
          "
        >

          <div
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-emerald-700
            "
          >
            Mapa Biológico
          </div>

          <p
            className="
              mt-4
              text-sm
              leading-7
              text-neutral-700
            "
          >
            Análise combinada
            entre peso,
            ganho médio diário,
            clima,
            lotação,
            sanidade
            e manejo operacional.
          </p>

        </div>

      </div>

    </main>
  );
}