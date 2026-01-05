// CardCFO.tsx
// CFO Financeiro — não bloqueante
// Next.js 16 | Client Component

"use client";

import { useEffect, useState } from "react";

type CFOResumo = {
  ebitda?: number;
  ebit?: number;
  roi?: number;
};

export default function CardCFO() {
  const [dados, setDados] = useState<CFOResumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/cfo/resumo");

        if (!res.ok) {
          setDados(null);
          return;
        }

        const json = await res.json();
        setDados(json);
      } catch {
        setDados(null);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        CFO Financeiro
      </h2>

      {loading && (
        <p className="text-sm text-gray-400">
          Analisando dados financeiros…
        </p>
      )}

      {!loading && !dados && (
        <p className="text-sm text-gray-500">
          Análises avançadas serão exibidas quando houver histórico suficiente.
        </p>
      )}

      {!loading && dados && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Item label="EBITDA" valor={dados.ebitda} />
          <Item label="EBIT" valor={dados.ebit} />
          <Item label="ROI" valor={dados.roi} sufixo="%" />
        </div>
      )}
    </div>
  );
}

function Item({
  label,
  valor,
  sufixo = "",
}: {
  label: string;
  valor?: number;
  sufixo?: string;
}) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold">
        {valor !== undefined
          ? `${valor.toLocaleString("pt-BR")}${sufixo}`
          : "—"}
      </p>
    </div>
  );
}
