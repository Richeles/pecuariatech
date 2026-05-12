import FinanceiroClient from "./components/FinanceiroClient";
import T from "@/app/components/T";

import { getIndicadoresFinanceiros } from "@/app/services/financeiro/getIndicadoresFinanceiros";

export const dynamic = "force-dynamic";

/* =========================================
   EQUAÇÃO Y — SERVICE LAYER
   Sem fetch interno
========================================= */

async function getData() {
  try {
    const data =
      await getIndicadoresFinanceiros();

    console.log(
      "FINANCEIRO SERVICE:",
      data
    );

    return data;
  } catch (err) {
    console.error(
      "Erro estrutural financeiro:",
      err
    );

    return null;
  }
}

export default async function FinanceiroPage() {

  const resumo = await getData();

  return (
    <main className="max-w-7xl mx-auto space-y-10 p-8">

      {/* =========================================
          HEADER PREMIUM
      ========================================= */}
      <header
        className="
          rounded-3xl
          border border-[#dce9df]
          bg-gradient-to-br
          from-[#f4faf5]
          via-[#edf6ef]
          to-[#e4f0e7]
          p-8
          shadow-sm
        "
      >

        <div className="space-y-3">

          <div
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-[#cfe2d3]
              bg-white
              px-4 py-2
              text-sm font-medium
              text-[#2c5a3f]
            "
          >
            🧠 CFO ULTRA · Intelligence Runtime
          </div>

          <h1
            className="
              text-4xl
              font-black
              tracking-tight
              text-[#173222]
            "
          >
            <T k="dashboard.modulos.financeiro.titulo" /> · CFO
          </h1>

          <p
            className="
              max-w-3xl
              text-[15px]
              leading-relaxed
              text-[#557564]
            "
          >
            <T k="dashboard.modulos.financeiro.desc" />
          </p>

        </div>

      </header>

      {/* =========================================
          KPI GRID
      ========================================= */}
      <section
        className="
          grid grid-cols-1
          gap-6
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        {[
          {
            label: "dashboard.cards.receita",
            value:
              resumo?.receita_total
                ? `R$ ${Number(
                    resumo.receita_total
                  ).toLocaleString("pt-BR")}`
                : "—",

            color: "text-[#2d8a4f]",
            bg: "from-[#f2fbf5] to-[#e4f5ea]",
          },

          {
            label: "dashboard.cards.custos",
            value:
              resumo?.custos_totais
                ? `R$ ${Number(
                    resumo.custos_totais
                  ).toLocaleString("pt-BR")}`
                : "—",

            color: "text-[#c05621]",
            bg: "from-[#fff8f2] to-[#fff0e5]",
          },

          {
            label: "dashboard.cards.resultado",
            value:
              resumo?.resultado_operacional
                ? `R$ ${Number(
                    resumo.resultado_operacional
                  ).toLocaleString("pt-BR")}`
                : "—",

            color: "text-[#176b87]",
            bg: "from-[#f2fbff] to-[#e2f5fb]",
          },

          {
            label: "dashboard.cards.margem",
            value:
              resumo?.margem_percentual
                ? `${Number(
                    resumo.margem_percentual
                  ).toFixed(1)}%`
                : "—",

            color: "text-[#6d4aff]",
            bg: "from-[#f6f3ff] to-[#ece7ff]",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`
              rounded-3xl
              border border-[#dce9df]
              bg-gradient-to-br ${kpi.bg}
              p-6
              shadow-sm
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-xl
            `}
          >

            <div className="space-y-4">

              <p className="text-sm font-medium text-[#557564]">
                <T k={kpi.label} />
              </p>

              <h2
                className={`
                  text-3xl
                  font-black
                  tracking-tight
                  ${kpi.color}
                `}
              >
                {kpi.value}
              </h2>

              <div
                className="
                  h-2 w-20
                  rounded-full
                  bg-white/70
                "
              />

            </div>

          </div>
        ))}

      </section>

      {/* =========================================
          CFO ULTRA
      ========================================= */}
      <section
        className="
          rounded-3xl
          border border-[#dce9df]
          bg-white
          p-8
          shadow-sm
        "
      >

        <div className="flex items-start justify-between gap-6">

          <div className="space-y-3">

            <h2
              className="
                text-2xl
                font-bold
                text-[#173222]
              "
            >
              <T k="dashboard.modulos.cfo.titulo" />
            </h2>

            <p
              className="
                max-w-3xl
                text-sm
                leading-relaxed
                text-[#557564]
              "
            >
              <T k="financeiro.sem_dados" />
            </p>

          </div>

          <div
            className="
              rounded-2xl
              border border-[#dce9df]
              bg-[#f5faf6]
              px-4 py-3
              text-sm font-medium
              text-[#2c5a3f]
            "
          >
            Runtime ativo
          </div>

        </div>

      </section>

      {/* =========================================
          ALERTA
      ========================================= */}
      <section
        className="
          rounded-3xl
          border border-[#ffe2a8]
          bg-[#fff8ea]
          p-6
          shadow-sm
        "
      >

        <div className="flex items-start gap-4">

          <div className="text-2xl">
            ⚠️
          </div>

          <div>

            <h3 className="font-semibold text-[#8a6116]">
              CFO Ultra Alert
            </h3>

            <p className="mt-2 text-sm text-[#9b741e]">
              <T k="financeiro.alerta_cfo" />
            </p>

          </div>

        </div>

      </section>

      {/* =========================================
          DRE
      ========================================= */}
      <section
        className="
          flex flex-col gap-6
          rounded-3xl
          border border-[#dce9df]
          bg-white
          p-8
          shadow-sm
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div>

          <h3
            className="
              text-xl
              font-bold
              text-[#173222]
            "
          >
            <T k="financeiro.dre.titulo" />
          </h3>

          <p className="mt-2 text-sm text-[#557564]">
            <T k="financeiro.dre.desc" />
          </p>

        </div>

        <button
          className="
            rounded-2xl
            bg-[#2f7a4d]
            px-6 py-3
            text-sm font-semibold
            text-white
            shadow-lg
            transition-all duration-300
            hover:bg-[#25643f]
            hover:shadow-xl
          "
        >
          <T k="financeiro.dre.acao" />
        </button>

      </section>

      {/* =========================================
          CLIENT COMPONENT
      ========================================= */}
      <FinanceiroClient resumo={resumo} />

    </main>
  );
}