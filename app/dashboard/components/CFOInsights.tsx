"use client";

// CFO Insights — recomendações inteligentes e justas
// Fonte: /api/financeiro/cfo/decisao

import { useEffect, useState } from "react";

type Insight = {
  titulo: string;
  mensagem: string;
  prioridade: "alta" | "media" | "baixa";
};

export default function CFOInsights() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/financeiro/cfo/decisao", {
          credentials: "include",
        });
        if (!res.ok) return;

        const json = await res.json();
        setInsight(json);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Analisando operação...</p>;
  }

  if (!insight) {
    return (
      <p className="text-sm text-gray-400">
        Nenhuma recomendação no momento.
      </p>
    );
  }

  const cor =
    insight.prioridade === "alta"
      ? "border-red-500 bg-red-900/20"
      : insight.prioridade === "media"
      ? "border-yellow-500 bg-yellow-900/20"
      : "border-green-500 bg-green-900/20";

  return (
    <section className={`rounded-xl p-6 border ${cor}`}>
      <h3 className="text-lg font-semibold text-white mb-2">
        {insight.titulo}
      </h3>
      <p className="text-sm text-gray-200">{insight.mensagem}</p>
    </section>
  );
}
