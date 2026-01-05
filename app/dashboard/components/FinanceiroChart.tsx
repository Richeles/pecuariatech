"use client";

// CAMINHO: app/dashboard/components/FinanceiroChart.tsx
// Gráfico Financeiro Real — Receita x Custos
// Dados vindos de /api/financeiro/dre

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DreMensal = {
  mes: string;
  receita: number;
  custos: number;
  resultado: number;
};

export default function FinanceiroChart() {
  const [dados, setDados] = useState<DreMensal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const res = await fetch("/api/financeiro/dre", {
        credentials: "include",
      });

      if (res.ok) {
        const json = await res.json();
        setDados(json);
      }

      setLoading(false);
    }

    carregar();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-400">
        Carregando gráfico financeiro...
      </div>
    );
  }

  if (!dados.length) {
    return (
      <div className="text-sm text-gray-400">
        Nenhum dado financeiro mensal disponível.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Receita x Custos (Mensal)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dados}>
          <XAxis dataKey="mes" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="receita"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="custos"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
