"use client";

// =========================================================
// PecuariaTech
// Plataforma Operacional BioFinanceira
// Financeiro Runtime Inteligente
// =========================================================

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type FinanceiroPayload = {
  receita: number;
  despesas: number;
  lucro: number;
  margem: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: any;
  error?: string | null;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function FinanceiroClient() {

  const [
    resumo,
    setResumo,
  ] = useState<
    FinanceiroPayload | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {

    let mounted = true;

    async function carregar() {

      try {

        setLoading(true);

        const response =
          await fetch(
            "/api/financeiro/basico",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {

          throw new Error(
            "Falha ao carregar runtime financeiro"
          );
        }

        const json:
          ApiResponse<FinanceiroPayload> =
            await response.json();

        if (!json.success) {

          throw new Error(
            json.error ??
            "Erro financeiro"
          );
        }

        if (mounted) {

          setResumo(
            json.data
          );
        }

      } catch (err: any) {

        console.error(
          "FINANCEIRO_RUNTIME:",
          err
        );

        if (mounted) {

          setError(
            err?.message ??
            "Erro interno"
          );
        }

      } finally {

        if (mounted) {

          setLoading(false);
        }
      }
    }

    carregar();

    return () => {

      mounted = false;
    };

  }, []);

  /* =====================================================
     FORMAT
  ===================================================== */

  function moeda(
    valor?: number | null
  ) {

    if (
      valor === null
      ||
      valor === undefined
    ) {

      return "R$ 0,00";
    }

    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-emerald-100
          bg-white
          p-10
          text-center
          shadow-sm
        "
      >

        <div
          className="
            text-sm
            font-semibold
            text-emerald-700
          "
        >
          Inicializando runtime
          biofinanceiro...
        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-red-100
          bg-red-50
          p-8
          shadow-sm
        "
      >

        <div className="space-y-2">

          <h2
            className="
              text-lg
              font-bold
              text-red-700
            "
          >
            Runtime Financeiro
          </h2>

          <p
            className="
              text-sm
              text-red-600
            "
          >
            {error}
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="space-y-8">

      {/* =================================================
          KPI GRID
      ================================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-6
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        {[
          {
            titulo: "Receita",
            valor: moeda(
              resumo?.receita
            ),
          },

          {
            titulo: "Despesas",
            valor: moeda(
              resumo?.despesas
            ),
          },

          {
            titulo: "Lucro",
            valor: moeda(
              resumo?.lucro
            ),
          },

          {
            titulo: "Margem",
            valor:
              `${(
                resumo?.margem ?? 0
              ).toFixed(1)}%`,
          },
        ].map((item) => (

          <div
            key={item.titulo}
            className="
              rounded-3xl
              border
              border-emerald-100
              bg-white
              p-6
              shadow-sm
            "
          >

            <div className="space-y-3">

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                {item.titulo}
              </p>

              <h2
                className="
                  text-3xl
                  font-black
                  text-emerald-700
                "
              >
                {item.valor}
              </h2>

            </div>

          </div>
        ))}

      </section>

      {/* =================================================
          CFO COGNITIVO
      ================================================= */}

      <section
        className="
          rounded-3xl
          border
          border-emerald-100
          bg-white
          p-8
          shadow-sm
        "
      >

        <div className="space-y-4">

          <h2
            className="
              text-2xl
              font-bold
              text-gray-900
            "
          >
            CFO Cognitivo BioFinanceiro
          </h2>

          <p
            className="
              text-sm
              leading-relaxed
              text-gray-600
            "
          >
            O runtime financeiro agora opera
            sobre governança semântica,
            payload padronizado e integração
            preparada para o Python Engine,
            Motor π e inteligência operacional
            biofinanceira do PecuariaTech.
          </p>

        </div>

      </section>

    </div>
  );
}