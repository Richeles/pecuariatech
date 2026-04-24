"use client";

import { useEffect, useState } from "react";

type FluxoItem = {
  data: string;
  valor: number;
  saldo_acumulado: number;
  status_caixa: string;
};

type ApiResponse = {
  ok: boolean;
  fluxo: FluxoItem[];
  resumo: {
    risco: string;
    recomendacao: string;
  };
};

export default function CFORealCard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/financeiro/fluxo", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Erro CFO:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <p className="text-gray-400">Carregando análise financeira...</p>
      </div>
    );
  }

  if (!data || !data.ok) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">Erro ao carregar CFO</p>
      </div>
    );
  }

  const { fluxo, resumo } = data;

  const corRisco =
    resumo.risco === "CRITICO"
      ? "text-red-600"
      : resumo.risco === "ATENCAO"
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="bg-white border rounded-xl p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          🧠 CFO Inteligente
        </h2>
        <p className="text-sm text-gray-500">
          Análise financeira automatizada da fazenda
        </p>
      </div>

      {/* RISCO */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Risco Financeiro</span>
        <span className={`font-bold ${corRisco}`}>
          {resumo.risco}
        </span>
      </div>

      {/* RECOMENDAÇÃO */}
      <div className="bg-gray-50 border rounded-lg p-4 text-sm">
        <strong>Recomendação:</strong> {resumo.recomendacao}
      </div>

      {/* LISTA DE FLUXO */}
      <div className="space-y-2 max-h-48 overflow-auto">
        {fluxo.map((item, i) => (
          <div
            key={i}
            className="flex justify-between text-sm border-b pb-1"
          >
            <span>{item.data}</span>
            <span
              className={
                item.valor >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              {item.valor >= 0 ? "+" : ""}
              R$ {item.valor.toFixed(2)}
            </span>
            <span className="text-gray-500">
              Saldo: R$ {item.saldo_acumulado.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}