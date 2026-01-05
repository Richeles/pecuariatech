"use client";

// CAMINHO: app/dashboard/components/CFOAutonomo.tsx
// CFO Autônomo — visão transparente da decisão

import { useEffect, useState } from "react";

type DecisaoCFO = {
  titulo: string;
  mensagem: string;
  prioridade: "baixa" | "media" | "alta";
  impacto_estimado: string;
  acao_recomendada: string;
};

export default function CFOAutonomo() {
  const [data, setData] = useState<DecisaoCFO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/financeiro/cfo/autonomo", {
          credentials: "include",
        });

        if (!res.ok) return;

        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        CFO analisando sua operação...
      </div>
    );
  }

  if (!data || !data.titulo) {
    return (
      <div className="text-sm text-gray-400">
        Nenhuma decisão estratégica no momento.
      </div>
    );
  }

  const cor =
    data.prioridade === "alta"
      ? "border-red-500 bg-red-900/20"
      : data.prioridade === "media"
      ? "border-yellow-500 bg-yellow-900/20"
      : "border-green-500 bg-green-900/20";

  return (
    <section className={`rounded-xl p-6 border ${cor}`}>
      <h3 className="text-lg font-semibold text-white mb-1">
        CFO Autônomo
      </h3>

      <p className="font-semibold text-white mt-2">
        {data.titulo}
      </p>

      <p className="text-sm text-gray-200 mt-2">
        {data.mensagem}
      </p>

      <div className="mt-4 text-sm text-gray-300">
        <p>
          <strong>Impacto estimado:</strong>{" "}
          {data.impacto_estimado}
        </p>
        <p className="mt-1">
          <strong>Ação recomendada:</strong>{" "}
          {data.acao_recomendada}
        </p>
      </div>
    </section>
  );
}
