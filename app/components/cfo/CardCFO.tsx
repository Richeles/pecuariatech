"use client";

// ======================================================
// PecuariaTech CFO — Card Financeiro Real (Produção)
// Fonte Y: GET /api/cfo/indicadores
// Seguro para Vercel / Next.js 16
// ======================================================

import { useEffect, useState } from "react";

type IndicadoresCFO = {
  receita_bruta: number;
  despesas_operacionais: number;
  resultado_operacional: number;
  margem_percentual: number;
};

type CFOResponse = {
  status: string;
  sistema: string;
  mes_referencia: string;
  indicadores: IndicadoresCFO;
  diagnostico: string;
};

export default function CardCFO() {
  const [dados, setDados] = useState<CFOResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarCFO() {
      try {
        const res = await fetch("/api/cfo/indicadores", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Falha ao obter dados do CFO");
        }

        const json = (await res.json()) as CFOResponse;

        if (!json || !json.indicadores) {
          throw new Error("Resposta CFO inválida");
        }

        setDados(json);
      } catch (err) {
        console.error("Erro CardCFO:", err);
        setErro("Não foi possível carregar o CFO financeiro");
      } finally {
        setLoading(false);
      }
    }

    carregarCFO();
  }, []);

  // =========================
  // ESTADOS DE UI
  // =========================
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-sm text-gray-500">
          Carregando PecuariaTech CFO…
        </p>
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-xl p-6">
        <p className="text-sm text-red-600">
          {erro ?? "Erro desconhecido no CFO"}
        </p>
      </div>
    );
  }

  const { indicadores, diagnostico, mes_referencia } = dados;

  // =========================
  // STATUS VISUAL (CFO)
  // =========================
  const classeStatus =
    indicadores.resultado_operacional < 0
      ? "bg-red-50 border-red-300"
      : indicadores.margem_percentual < 10
      ? "bg-yellow-50 border-yellow-300"
      : "bg-green-50 border-green-300";

  const corResultado =
    indicadores.resultado_operacional < 0
      ? "text-red-600"
      : "text-green-700";

  return (
    <div className={`rounded-xl border p-6 ${classeStatus}`}>
      <h3 className="text-lg font-semibold mb-1">
        PecuariaTech CFO — Visão Mensal
      </h3>

      <p className="text-xs text-gray-500 mb-4">
        Mês de referência: {mes_referencia}
      </p>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Receita Bruta</p>
          <p className="font-semibold">
            R$ {indicadores.receita_bruta.toLocaleString("pt-BR")}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Despesas Operacionais</p>
          <p className="font-semibold">
            R$ {indicadores.despesas_operacionais.toLocaleString("pt-BR")}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Resultado Operacional</p>
          <p className={`font-semibold ${corResultado}`}>
            R$ {indicadores.resultado_operacional.toLocaleString("pt-BR")}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Margem</p>
          <p className="font-semibold">
            {indicadores.margem_percentual}%
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm">
        <span className="font-medium">Diagnóstico CFO:</span>
        <p className="mt-1 text-gray-700">{diagnostico}</p>
      </div>
    </div>
  );
}
