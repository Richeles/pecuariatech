"use client";

// CAMINHO: app/dashboard/DashboardClient.tsx
// Dashboard Real — PecuariaTech
// KPIs Financeiros + UltraCFO Autônomo
// Next.js 16 + TypeScript strict

import { useEffect, useState } from "react";

// ===============================
// TIPOS
// ===============================
type IndicadoresFinanceiros = {
  receita_total: number;
  custos_totais: number;
  resultado: number;
  margem_percentual: number;
};

type DecisaoCFO = {
  titulo: string;
  mensagem: string;
  prioridade: "baixa" | "media" | "alta";
  impacto_estimado: string;
  acao_recomendada: string;
};

// ===============================
// COMPONENTE PRINCIPAL
// ===============================
export default function DashboardClient() {
  const [dados, setDados] = useState<IndicadoresFinanceiros | null>(null);
  const [cfo, setCfo] = useState<DecisaoCFO | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarTudo() {
      try {
        // KPIs financeiros
        const resIndicadores = await fetch(
          "/api/financeiro/indicadores-avancados",
          { credentials: "include" }
        );

        if (!resIndicadores.ok) {
          throw new Error("Falha ao carregar indicadores financeiros");
        }

        const json = await resIndicadores.json();

        setDados({
          receita_total: json.receita ?? 0,
          custos_totais: json.custos ?? 0,
          resultado: json.resultado ?? 0,
          margem_percentual: json.margem_percentual ?? 0,
        });

        // UltraCFO
        const resCFO = await fetch(
          "/api/financeiro/cfo/autonomo",
          { credentials: "include" }
        );

        if (resCFO.ok) {
          const cfoJson = await resCFO.json();
          setCfo(cfoJson);
        }
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }

    carregarTudo();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Carregando dados do sistema...
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="text-sm text-red-400">
        Nenhum dado financeiro disponível.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-bold text-white">
          Dashboard PecuariaTech
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Visão financeira consolidada + CFO Autônomo
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          titulo="Receita"
          valor={`R$ ${dados.receita_total.toFixed(2)}`}
        />
        <KpiCard
          titulo="Custos"
          valor={`R$ ${dados.custos_totais.toFixed(2)}`}
        />
        <KpiCard
          titulo="Resultado"
          valor={`R$ ${dados.resultado.toFixed(2)}`}
          destaque
        />
        <KpiCard
          titulo="Margem"
          valor={`${dados.margem_percentual.toFixed(1)}%`}
        />
      </section>

      {/* ULTRA CFO */}
      {cfo && (
        <section>
          <UltraCFOCard decisao={cfo} />
        </section>
      )}
    </div>
  );
}

// ===============================
// KPI CARD
// ===============================
function KpiCard({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        destaque
          ? "border-green-500 bg-green-900/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm text-gray-300">{titulo}</p>
      <p className="text-2xl font-semibold text-white mt-2">{valor}</p>
    </div>
  );
}

// ===============================
// ULTRA CFO CARD
// ===============================
function UltraCFOCard({ decisao }: { decisao: DecisaoCFO }) {
  const cor =
    decisao.prioridade === "alta"
      ? "border-red-500 bg-red-900/20"
      : decisao.prioridade === "media"
      ? "border-yellow-500 bg-yellow-900/20"
      : "border-green-500 bg-green-900/20";

  return (
    <div className={`rounded-xl p-6 border ${cor}`}>
      <h2 className="text-xl font-bold text-white mb-2">
        UltraCFO — {decisao.titulo}
      </h2>

      <p className="text-sm text-gray-200 mb-4">
        {decisao.mensagem}
      </p>

      <div className="text-sm text-gray-300 space-y-1">
        <p>
          <strong>Impacto estimado:</strong>{" "}
          {decisao.impacto_estimado}
        </p>
        <p>
          <strong>Ação recomendada:</strong>{" "}
          {decisao.acao_recomendada}
        </p>
      </div>
    </div>
  );
}
