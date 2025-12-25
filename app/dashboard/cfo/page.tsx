// CAMINHO: app/dashboard/cfo/page.tsx
// Next.js 16 + TypeScript strict
// Dashboard CFO Real — leitura pura
// Equação Y preservada

"use client";

import { useEffect, useState } from "react";

type DecisaoCFO = {
  id: string;
  origem: string;
  nivel: "critico" | "atencao" | "normal";
  resultado_operacional: number;
  margem_percentual: number;
  mensagem: string;
  criado_em: string;
};

export default function DashboardCFO() {
  const [decisoes, setDecisoes] = useState<DecisaoCFO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cfo/decisoes/latest", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setDecisoes(json.decisoes || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Carregando CFO...</div>;
  }

  const ultima = decisoes[0];

  const corNivel =
    ultima?.nivel === "critico"
      ? "bg-red-600"
      : ultima?.nivel === "atencao"
      ? "bg-yellow-500"
      : "bg-green-600";

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">CFO Ultra — Diagnóstico Financeiro</h1>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 text-white ${corNivel}`}>
          <p className="text-sm opacity-90">Status CFO</p>
          <p className="text-2xl font-bold capitalize">
            {ultima?.nivel || "-"}
          </p>
        </div>

        <div className="rounded-xl p-4 bg-white shadow">
          <p className="text-sm text-gray-500">Resultado Operacional</p>
          <p className="text-2xl font-bold">
            R$ {ultima?.resultado_operacional?.toLocaleString("pt-BR") || "0"}
          </p>
        </div>

        <div className="rounded-xl p-4 bg-white shadow">
          <p className="text-sm text-gray-500">Margem</p>
          <p className="text-2xl font-bold">
            {ultima?.margem_percentual ?? 0}%
          </p>
        </div>
      </div>

      {/* Última decisão */}
      <div className="rounded-xl p-4 bg-white shadow">
        <p className="text-sm text-gray-500 mb-1">Última decisão do CFO</p>
        <p className="text-base font-medium">{ultima?.mensagem}</p>
        <p className="text-xs text-gray-400 mt-2">
          {ultima?.criado_em
            ? new Date(ultima.criado_em).toLocaleString("pt-BR")
            : ""}
        </p>
      </div>

      {/* Histórico */}
      <div className="rounded-xl p-4 bg-white shadow">
        <p className="text-sm font-semibold mb-3">
          Histórico recente de decisões
        </p>

        <ul className="space-y-2">
          {decisoes.map((d) => (
            <li
              key={d.id}
              className="flex justify-between border-b pb-2 text-sm"
            >
              <span className="capitalize font-medium">{d.nivel}</span>
              <span>
                R$ {d.resultado_operacional.toLocaleString("pt-BR")}
              </span>
              <span className="text-gray-400">
                {new Date(d.criado_em).toLocaleDateString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
