// app/dashboard/DashboardClient.tsx
// Dashboard Real — PecuariaTech
// Client Component
// Next.js 16 | TypeScript strict

"use client";

import { useEffect, useState } from "react";
import GraficoFinanceiro from "./components/GraficoFinanceiro";
import CardCFO from "../components/cfo/CardCFO";

// =======================
// TIPOS
// =======================
type DreMensal = {
  mes_referencia: string;
  receita_bruta: number;
  despesas_operacionais: number;
  resultado_operacional: number;
};

type FinanceiroMensalGrafico = {
  periodo: string;
  receita_total: number;
  custo_total: number;
  resultado_operacional: number;
};

export default function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [dre, setDre] = useState<DreMensal[]>([]);
  const [grafico, setGrafico] = useState<FinanceiroMensalGrafico[]>([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const res = await fetch("/api/financeiro/dre");

        if (!res.ok) {
          throw new Error("Falha ao buscar DRE");
        }

        const data: DreMensal[] = await res.json();

        const ordenado = [...data].sort(
          (a, b) =>
            new Date(b.mes_referencia).getTime() -
            new Date(a.mes_referencia).getTime()
        );

        setDre(ordenado);

        setGrafico(
          ordenado.map((item) => ({
            periodo: item.mes_referencia,
            receita_total: item.receita_bruta,
            custo_total: item.despesas_operacionais,
            resultado_operacional: item.resultado_operacional,
          }))
        );
      } catch {
        // SILENCIOSO: zero ≠ erro
        setDre([]);
        setGrafico([]);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando Dashboard…</div>;
  }

  const atual = dre[0];
  const anterior = dre[1];

  const receita = atual?.receita_bruta ?? 0;
  const custos = atual?.despesas_operacionais ?? 0;
  const resultado = atual?.resultado_operacional ?? 0;

  const margem =
    receita > 0 ? (resultado / receita) * 100 : 0;

  const delta = (a: number, b?: number) =>
    !b || b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">
        Dashboard — PecuariaTech
      </h1>

      {/* AVISO ÚNICO E NEUTRO */}
      {dre.length === 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-3 text-sm text-yellow-800">
          Nenhum dado financeiro disponível ainda.
        </div>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card titulo="Receita" valor={receita} delta={delta(receita, anterior?.receita_bruta)} />
        <Card titulo="Custos" valor={custos} delta={delta(custos, anterior?.despesas_operacionais)} />
        <Card titulo="Resultado" valor={resultado} delta={delta(resultado, anterior?.resultado_operacional)} />
        <Card titulo="Margem" valor={`${margem.toFixed(2)}%`} />
      </div>

      {/* CFO — NUNCA BLOQUEIA */}
      <CardCFO />

      {/* GRÁFICO */}
      <GraficoFinanceiro dados={grafico} />
    </div>
  );
}

function Card({
  titulo,
  valor,
  delta,
}: {
  titulo: string;
  valor: number | string;
  delta?: number;
}) {
  const texto =
    typeof valor === "number"
      ? `R$ ${valor.toLocaleString("pt-BR")}`
      : valor;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold">{texto}</p>
      {delta !== undefined && (
        <p className={`text-xs mt-1 ${delta >= 0 ? "text-green-600" : "text-red-600"}`}>
          Δ {delta >= 0 ? "+" : ""}
          {delta.toFixed(2)}%
        </p>
      )}
    </div>
  );
}
