// app/dashboard/components/GraficoFinanceiro.tsx
// Gráfico Financeiro Mensal — CFO Grade
// Next.js 16 | Client Component

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// =======================
// TIPOS
// =======================
type FinanceiroMensalGrafico = {
  periodo: string;
  receita_total: number;
  custo_total: number;
  resultado_operacional: number;
};

type Props = {
  dados: FinanceiroMensalGrafico[];
};

export default function GraficoFinanceiro({ dados }: Props) {
  if (!dados || dados.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-gray-500">
        Nenhum dado financeiro disponível para o período.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        Evolução Financeira Mensal
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" />
          <YAxis />
          <Tooltip
            formatter={(value: number) =>
              `R$ ${value.toLocaleString("pt-BR")}`
            }
          />

          <Line
            type="monotone"
            dataKey="receita_total"
            name="Receita"
            stroke="#16a34a"
            strokeWidth={2}
          />

          <Line
            type="monotone"
            dataKey="custo_total"
            name="Custos"
            stroke="#dc2626"
            strokeWidth={2}
          />

          <Line
            type="monotone"
            dataKey="resultado_operacional"
            name="Resultado"
            stroke="#2563eb"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
