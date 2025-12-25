// CAMINHO: app/dashboard/cfo/recomendacoes/page.tsx
// Next.js 16 + TypeScript strict
// PecuariaTech — Recomendações CFO AI
// UI somente leitura (API-driven)

"use client";

import { useEffect, useState } from "react";

type InterpretacaoCFO = {
  prioridade: "IMEDIATA" | "ALTA" | "NORMAL";
  acao_principal: string;
  recomendacoes: string[];
  horizonte: string;
};

type RespostaAPI = {
  status: string;
  origem: string;
  nivel: string;
  resultado_operacional: number;
  mensagem_cfo: string;
  interpretacao: InterpretacaoCFO;
};

export default function RecomendacoesCFO() {
  const [dados, setDados] = useState<RespostaAPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pecuariatech/cfo/interpretar", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => setDados(json))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6">Carregando recomendações...</div>;
  }

  if (!dados || dados.status !== "ok") {
    return (
      <div className="p-6 text-red-600">
        Erro ao carregar recomendações do CFO.
      </div>
    );
  }

  const corPrioridade =
    dados.interpretacao.prioridade === "IMEDIATA"
      ? "bg-red-600"
      : dados.interpretacao.prioridade === "ALTA"
      ? "bg-yellow-500"
      : "bg-green-600";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        Recomendações Financeiras — CFO
      </h1>

      {/* PRIORIDADE */}
      <div className={`rounded-xl p-4 text-white ${corPrioridade}`}>
        <p className="text-sm opacity-90">Prioridade</p>
        <p className="text-2xl font-bold">
          {dados.interpretacao.prioridade}
        </p>
      </div>

      {/* AÇÃO PRINCIPAL */}
      <div className="rounded-xl p-4 bg-white shadow">
        <p className="text-sm text-gray-500 mb-1">
          Ação principal recomendada
        </p>
        <p className="text-lg font-semibold">
          {dados.interpretacao.acao_principal}
        </p>
      </div>

      {/* MENSAGEM DO CFO */}
      <div className="rounded-xl p-4 bg-white shadow">
        <p className="text-sm text-gray-500 mb-1">
          Diagnóstico do CFO
        </p>
        <p className="text-base">{dados.mensagem_cfo}</p>
      </div>

      {/* LISTA DE RECOMENDAÇÕES */}
      <div className="rounded-xl p-4 bg-white shadow">
        <p className="text-sm font-semibold mb-3">
          Recomendações detalhadas
        </p>

        <ul className="list-disc pl-5 space-y-2">
          {dados.interpretacao.recomendacoes.map(
            (rec, index) => (
              <li key={index}>{rec}</li>
            )
          )}
        </ul>
      </div>

      {/* HORIZONTE */}
      <div className="rounded-xl p-4 bg-white shadow">
        <p className="text-sm text-gray-500 mb-1">
          Horizonte de ação
        </p>
        <p className="text-lg font-semibold">
          {dados.interpretacao.horizonte}
        </p>
      </div>
    </div>
  );
}
