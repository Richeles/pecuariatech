"use client";

// app/dashboard/financeiro/FinanceiroClient.tsx
// Client Component — Preparado para dados reais do CFO

type ResumoFinanceiro = {
  receita_total: number | null;
  custos_totais: number | null;
  resultado: number | null;
  margem_percentual: number | null;
  periodo: string | null;
};

export default function FinanceiroClient({
  resumo,
}: {
  resumo: ResumoFinanceiro | null;
}) {
  const formatarMoeda = (v: number | null) =>
    v === null ? "—" : `R$ ${v.toFixed(2).replace(".", ",")}`;

  const formatarPercentual = (v: number | null) =>
    v === null ? "—" : `${v.toFixed(1)}%`;

  return (
    <>
      {/* KPIs DINÂMICOS */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Kpi titulo="Receita" valor={formatarMoeda(resumo?.receita_total ?? null)} />
        <Kpi titulo="Custos" valor={formatarMoeda(resumo?.custos_totais ?? null)} />
        <Kpi titulo="Resultado" valor={formatarMoeda(resumo?.resultado ?? null)} />
        <Kpi
          titulo="Margem"
          valor={formatarPercentual(resumo?.margem_percentual ?? null)}
        />
      </section>

      {/* DIAGNÓSTICO DO CFO */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">
          Diagnóstico Financeiro (CFO)
        </h3>

        {!resumo ? (
          <p className="text-sm text-gray-600">
            Nenhum dado financeiro disponível ainda.
            <br />
            Registre receitas e custos para liberar análises automáticas.
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            O CFO Autônomo está analisando o período{" "}
            <strong>{resumo.periodo ?? "atual"}</strong> para identificar
            oportunidades de melhoria financeira.
          </p>
        )}
      </section>
    </>
  );
}

/* COMPONENTE KPI */

function Kpi({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-green-700 mt-1">{valor}</p>
    </div>
  );
}
