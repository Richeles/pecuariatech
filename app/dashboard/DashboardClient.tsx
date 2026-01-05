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
  const [hasFinanceiro, setHasFinanceiro] = useState(false);

  const [dre, setDre] = useState<DreMensal[]>([]);
  const [grafico, setGrafico] = useState<FinanceiroMensalGrafico[]>([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const res = await fetch("/api/financeiro/dre", {
          credentials: "include", // 🔐 ENVIA COOKIE DE SESSÃO
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn("Financeiro indisponível:", res.status);
          return;
        }

        const data: DreMensal[] = await res.json();

        if (Array.isArray(data) && data.length > 0) {
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
          setHasFinanceiro(true);
        }
      } catch (e) {
        console.error("Falha ao carregar financeiro:", e);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando Dashboard…</div>;
  }

  // =======================
  // DADOS (OU PLACEHOLDERS)
  // =======================
  const dreAtual = dre[0] ?? {
    receita_bruta: 0,
    despesas_operacionais: 0,
    resultado_operacional: 0,
  };

  const dreAnterior = dre[1];

  const calcularDelta = (atual: number, anterior?: number) =>
    !anterior || anterior === 0
      ? 0
      : ((atual - anterior) / Math.abs(anterior)) * 100;

  const margemPercentual =
    dreAtual.receita_bruta > 0
      ? (dreAtual.resultado_operacional / dreAtual.receita_bruta) * 100
      : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-700">
        Dashboard — PecuariaTech
      </h1>

      {!hasFinanceiro && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
          Nenhum dado financeiro disponível ainda.
        </div>
      )}

      {/* CARDS SEMPRE VISÍVEIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card titulo="Receita" valor={`R$ ${dreAtual.receita_bruta.toLocaleString("pt-BR")}`} />
        <Card titulo="Custos" valor={`R$ ${dreAtual.despesas_operacionais.toLocaleString("pt-BR")}`} />
        <Card titulo="Resultado" valor={`R$ ${dreAtual.resultado_operacional.toLocaleString("pt-BR")}`} />
        <Card titulo="Margem" valor={`${margemPercentual.toFixed(2)}%`} />
      </div>

      {/* CFO BLINDADO — NUNCA QUEBRA */}
      <div>
        <CardCFO />
      </div>

      {/* GRÁFICO SEMPRE PRESENTE */}
      <GraficoFinanceiro dados={grafico} />
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
    </div>
  );
}
