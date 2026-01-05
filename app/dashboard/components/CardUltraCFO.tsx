// CAMINHO: app/dashboard/components/CardUltraCFO.tsx
// Card UltraCFO — Dashboard Executivo
// Next.js 16 | Client Component

"use client";

import { useEffect, useState } from "react";

type CFOResponse = {
  titulo: string;
  mensagem: string;
  prioridade: "baixa" | "media" | "alta";
  impacto_estimado: string;
  acao_recomendada: string;
  plano_recomendado?: string;
};

export default function CardUltraCFO() {
  const [dados, setDados] = useState<CFOResponse | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    fetch("/api/financeiro/cfo/autonomo", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.titulo) setDados(json);
        else setErro(true);
      })
      .catch(() => setErro(true));
  }, []);

  if (erro) return null;
  if (!dados) return null;

  const cor =
    dados.prioridade === "alta"
      ? "border-red-500 bg-red-50"
      : dados.prioridade === "media"
      ? "border-yellow-500 bg-yellow-50"
      : "border-green-500 bg-green-50";

  return (
    <div className={`rounded-xl border p-6 ${cor}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          🧠 UltraCFO — Diagnóstico Financeiro
        </h3>
        <span className="text-xs uppercase font-bold">
          Prioridade: {dados.prioridade}
        </span>
      </div>

      <h4 className="text-base font-semibold mb-1">
        {dados.titulo}
      </h4>

      <p className="text-sm text-gray-700 mb-3">
        {dados.mensagem}
      </p>

      <div className="text-sm mb-2">
        <strong>Impacto:</strong> {dados.impacto_estimado}
      </div>

      <div className="text-sm mb-4">
        <strong>Ação recomendada:</strong> {dados.acao_recomendada}
      </div>

      {dados.plano_recomendado && (
        <div className="text-sm font-semibold text-green-700">
          📌 Plano indicado pelo CFO:{" "}
          {dados.plano_recomendado.toUpperCase()}
        </div>
      )}
    </div>
  );
}
