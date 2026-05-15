"use client";

// =========================================================
// PecuariaTech
// Financeiro Runtime Inteligente
// =========================================================

import {
  useEffect,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type ResumoFinanceiro = {
  receita_total: number | null;
  custos_totais: number | null;
  resultado_operacional: number | null;
  margem_percentual: number | null;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function FinanceiroClient() {

  const [
    resumo,
    setResumo,
  ] = useState<
    ResumoFinanceiro | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {

    let mounted = true;

    async function carregar() {

      try {

        const response =
          await fetch(
            "/api/financeiro/fluxo",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {

          throw new Error(
            "Erro financeiro"
          );
        }

        const data =
          await response.json();

        if (mounted) {

          setResumo(data);
        }

      } catch (err) {

        console.error(
          "FINANCEIRO:",
          err
        );

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

      return "—";
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
          Carregando runtime financeiro...
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
              resumo?.receita_total
            ),
          },

          {
            titulo: "Custos",
            valor: moeda(
              resumo?.custos_totais
            ),
          },

          {
            titulo: "Resultado",
            valor: moeda(
              resumo?.resultado_operacional
            ),
          },

          {
            titulo: "Margem",
            valor:
              resumo?.margem_percentual
                ? `${resumo.margem_percentual.toFixed(1)}%`
                : "—",
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
          CFO
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
            CFO Cognitivo
          </h2>

          <p
            className="
              text-sm
              leading-relaxed
              text-gray-600
            "
          >
            Runtime financeiro estabilizado.
            O sistema agora opera de forma
            modular, desacoplada e preparada
            para evolução cognitiva autônoma.
          </p>

        </div>

      </section>

    </div>
  );
}