// CAMINHO: app/dashboard/cfo/page.tsx
// PecuariaTech Autônomo — Dashboard CFO
// Fonte Y | Token real | CFO Autônomo ativo
// Linux / Vercel safe

"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import CFOResumoEstrategico from "../../components/cfo/CFOResumoEstrategico";

// ===============================
// TIPOS
// ===============================
type Indicadores = {
  receita_total: number;
  custo_total: number;
  resultado_operacional: number;
  margem_percentual: number;
};

export default function DashboardCFO() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarIndicadores() {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (!session?.access_token) {
          setErro("Sessão não encontrada");
          return;
        }

        const headers = {
          Authorization: `Bearer ${session.access_token}`,
        };

        const res = await fetch(
          "/api/financeiro/indicadores-avancados",
          { headers }
        );

        if (!res.ok) {
          throw new Error("Erro ao carregar indicadores financeiros");
        }

        const json = await res.json();
        setIndicadores(json.indicadores);
      } catch (e) {
        console.error("Erro Dashboard CFO:", e);
        setErro("Falha ao carregar o CFO financeiro");
      } finally {
        setLoading(false);
      }
    }

    carregarIndicadores();
  }, []);

  if (loading) {
    return <p className="p-6">Analisando dados financeiros...</p>;
  }

  if (erro) {
    return <p className="p-6 text-red-600">{erro}</p>;
  }

  if (!indicadores) {
    return (
      <p className="p-6 text-yellow-700">
        Nenhum dado financeiro encontrado para este usuário.
      </p>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">
        CFO Autônomo · PecuariaTech
      </h1>

      {/* RESUMO ESTRATÉGICO (B4) */}
      <CFOResumoEstrategico />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI titulo="Receita" valor={indicadores.receita_total} />
        <KPI titulo="Custos" valor={indicadores.custo_total} />
        <KPI titulo="Resultado" valor={indicadores.resultado_operacional} />
        <KPI
          titulo="Margem"
          valor={`${indicadores.margem_percentual}%`}
        />
      </div>
    </div>
  );
}

// ===============================
// COMPONENTES AUXILIARES
// ===============================
function KPI({ titulo, valor }: { titulo: string; valor: number | string }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-xl font-semibold">{valor}</p>
    </div>
  );
}
