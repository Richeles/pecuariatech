"use client";

// KPIs CFO — EBITDA, Margem, Tendência
// Dados reais via APIs existentes

import { useEffect, useState } from "react";

type KPI = {
  ebitda: number;
  margem: number;
  tendencia: "alta" | "estavel" | "queda";
};

export default function CFOIndicators() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [ebitdaRes, tendenciaRes] = await Promise.all([
          fetch("/api/financeiro/ebitda", { credentials: "include" }),
          fetch("/api/financeiro/tendencia", { credentials: "include" }),
        ]);

        if (!ebitdaRes.ok || !tendenciaRes.ok) return;

        const ebitdaJson = await ebitdaRes.json();
        const tendenciaJson = await tendenciaRes.json();

        setKpi({
          ebitda: ebitdaJson.ebitda ?? 0,
          margem: ebitdaJson.margem_percentual ?? 0,
          tendencia: tendenciaJson.tendencia ?? "estavel",
        });
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Carregando KPIs do CFO...</p>;
  }

  if (!kpi) {
    return <p className="text-sm text-gray-400">KPIs indisponíveis.</p>;
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card titulo="EBITDA" valor={`R$ ${kpi.ebitda.toFixed(2)}`} />
      <Card titulo="Margem Operacional" valor={`${kpi.margem.toFixed(1)}%`} />
      <Card
        titulo="Tendência"
        valor={
          kpi.tendencia === "alta"
            ? "↑ Alta"
            : kpi.tendencia === "queda"
            ? "↓ Queda"
            : "→ Estável"
        }
        destaque
      />
    </section>
  );
}

function Card({
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
          ? "border-blue-500 bg-blue-900/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm text-gray-300">{titulo}</p>
      <p className="text-2xl font-semibold text-white mt-2">{valor}</p>
    </div>
  );
}
