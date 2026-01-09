"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase-browser";

type DreLinha = {
  mes_referencia: string;
  receita_bruta: number;
  despesas_operacionais: number;
  resultado_operacional: number;
};

export default function DreClient() {
  const [dados, setDados] = useState<DreLinha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDre() {
      const { data, error } = await supabase
        .from("dre_mensal_view")
        .select("*")
        .order("mes_referencia", { ascending: false });

      if (!error && data) {
        setDados(data);
      }

      setLoading(false);
    }

    carregarDre();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando dados…</p>;
  }

  if (dados.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          Nenhum dado disponível ainda. O DRE será exibido após lançamentos
          financeiros.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Mês</th>
            <th className="px-4 py-3 text-right">Receita</th>
            <th className="px-4 py-3 text-right">Custos</th>
            <th className="px-4 py-3 text-right">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((linha) => (
            <tr key={linha.mes_referencia} className="border-t">
              <td className="px-4 py-2">
                {new Date(linha.mes_referencia).toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-2 text-right text-green-700">
                R$ {linha.receita_bruta.toLocaleString("pt-BR")}
              </td>
              <td className="px-4 py-2 text-right text-red-600">
                R$ {linha.despesas_operacionais.toLocaleString("pt-BR")}
              </td>
              <td className="px-4 py-2 text-right font-semibold">
                R$ {linha.resultado_operacional.toLocaleString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
