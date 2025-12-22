// app/dashboard/page.tsx
// Dashboard Real — PecuariaTech
// Next.js 16 | TypeScript strict

"use client";

import { useEffect, useState } from "react";
import GraficoFinanceiro from "./components/GraficoFinanceiro";

// =======================
// TIPOS
// =======================
type DreMensal = {
  mes_referencia: string;
  receita_bruta: number;
  despesas_operacionais: number;
  resultado_operacional: number;
};

type EbitdaMensal = {
  mes_referencia: string;
  receita: number;
  despesas: number;
  ebitda: number;
};

type SanidadeMensal = {
  mes_referencia: string;
  eventos_sanitarios: number;
  custo_sanitario_total: number;
};

type FinanceiroMensalGrafico = {
  periodo: string;
  receita_total: number;
  custo_total: number;
  resultado_operacional: number;
};

export default function DashboardReal() {
  const [loading, setLoading] = useState<boolean>(true);

  const [dre, setDre] = useState<DreMensal[]>([]);
  const [ebitda, setEbitda] = useState<EbitdaMensal[]>([]);
  const [sanidade, setSanidade] = useState<SanidadeMensal[]>([]);
  const [grafico, setGrafico] = useState<FinanceiroMensalGrafico[]>([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [dreRes, ebitdaRes, sanidadeRes] = await Promise.all([
          fetch("/api/financeiro/dre"),
          fetch("/api/financeiro/ebitda"),
          fetch("/api/financeiro/sanidade"),
        ]);

        if (!dreRes.ok || !ebitdaRes.ok || !sanidadeRes.ok) {
          throw new Error("Falha ao buscar dados financeiros");
        }

        const dreData: DreMensal[] = await dreRes.json();
        const ebitdaData: EbitdaMensal[] = await ebitdaRes.json();
        const sanidadeData: SanidadeMensal[] = await sanidadeRes.json();

        const ordenar = <T extends { mes_referencia: string }>(arr: T[]) =>
          [...arr].sort(
            (a, b) =>
              new Date(b.mes_referencia).getTime() -
              new Date(a.mes_referencia).getTime()
          );

        const dreOrdenado = ordenar(dreData);

        setDre(dreOrdenado);
        setEbitda(ordenar(ebitdaData));
        setSanidade(ordenar(sanidadeData));

        setGrafico(
          dreOrdenado.map((item) => ({
            periodo: item.mes_referencia,
            receita_total: item.receita_bruta,
            custo_total: item.despesas_operacionais,
            resultado_operacional: item.resultado_operacional,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar dashboard financeiro:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Carregando Dashboard Financeiro…</div>;
  }

  const dreAtual = dre[0];
  const dreAnterior = dre[1];

  if (!dreAtual) {
    return (
      <div className="p-6 text-red-600">
        Erro ao carregar dados financeiros reais.
      </div>
    );
  }

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
        Dashboard Real — PecuariaTech
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          titulo="Receita"
          valor={`R$ ${dreAtual.receita_bruta.toLocaleString("pt-BR")}`}
          delta={calcularDelta(dreAtual.receita_bruta, dreAnterior?.receita_bruta)}
        />
        <Card
          titulo="Custos"
          valor={`R$ ${dreAtual.despesas_operacionais.toLocaleString("pt-BR")}`}
          delta={calcularDelta(
            dreAtual.despesas_operacionais,
            dreAnterior?.despesas_operacionais
          )}
        />
        <Card
          titulo="Resultado"
          valor={`R$ ${dreAtual.resultado_operacional.toLocaleString("pt-BR")}`}
          delta={calcularDelta(
            dreAtual.resultado_operacional,
            dreAnterior?.resultado_operacional
          )}
        />
        <Card titulo="Margem" valor={`${margemPercentual.toFixed(2)}%`} />
      </div>

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
  valor: string;
  delta?: number;
}) {
  const deltaCor =
    delta === undefined
      ? "text-gray-400"
      : delta > 0
      ? "text-green-600"
      : delta < 0
      ? "text-red-600"
      : "text-gray-500";

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
      {delta !== undefined && (
        <p className={`text-xs mt-1 ${deltaCor}`}>
          Δ {delta > 0 ? "+" : ""}
          {delta.toFixed(2)}%
        </p>
      )}
    </div>
  );
}
