"use client";

// CAMINHO: app/dashboard/DashboardClient.tsx
// Dashboard Real — PecuariaTech
// Conectado às APIs financeiras reais
// Next.js 16 + TypeScript strict

import { useEffect, useState } from "react";

// ===============================
// TIPOS
// ===============================
type IndicadoresFinanceiros = {
  receita_total: number;
  custos_totais: number;
  resultado: number;
  margem_percentual: number;
};

// ===============================
// COMPONENTE
// ===============================
export default function DashboardClient() {
  const [dados, setDados] = useState<IndicadoresFinanceiros | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarIndicadores() {
      try {
        const res = await fetch("/api/financeiro/indicadores-avancados", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Falha ao carregar indicadores financeiros");
        }

        const json = await res.json();

        // A API já retorna os dados consolidados
        setDados({
          receita_total: json.receita ?? 0,
          custos_totais: json.custos ?? 0,
          resultado: json.resultado ?? 0,
          margem_percentual: json.margem_percentual ?? 0,
        });
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }

    carregarIndicadores();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Carregando dados financeiros...
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="text-sm text-red-400">
        Nenhum dado financeiro disponível.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-bold text-white">
          Dashboard PecuariaTech
        </h1>
        <p className="text-sm text-gray-300 mt-1">
          Visão financeira consolidada
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          titulo="Receita"
          valor={`R$ ${dados.receita_total.toFixed(2)}`}
        />
        <KpiCard
          titulo="Custos"
          valor={`R$ ${dados.custos_totais.toFixed(2)}`}
        />
        <KpiCard
          titulo="Resultado"
          valor={`R$ ${dados.resultado.toFixed(2)}`}
          destaque
        />
        <KpiCard
          titulo="Margem"
          valor={`${dados.margem_percentual.toFixed(1)}%`}
        />
      </section>
    </div>
  );
}

// ===============================
// COMPONENTE AUXILIAR
// ===============================
function KpiCard({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        destaque
          ? "border-green-500 bg-green-900/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-sm text-gray-300">{titulo}</p>
      <p className="text-2xl font-semibold text-white mt-2">{valor}</p>
    </div>
  );
}
