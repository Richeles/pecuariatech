// app/dashboard/cfo/page.tsx
// PecuariaTech Autônomo — Dashboard CFO
// Fonte Y | Token real | CFO Autônomo ativo

"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/app/lib/supabaseClient";

// ===============================
// TIPOS
// ===============================
type Indicadores = {
  receita_total: number;
  custo_total: number;
  resultado_operacional: number;
  margem_percentual: number;
};

type DecisaoCFO = {
  decisao: string;
  prioridade: "baixa" | "media" | "alta";
};

export default function DashboardCFO() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [decisao, setDecisao] = useState<DecisaoCFO | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (!session) {
          setErro("Sessão não encontrada");
          return;
        }

        const headers = {
          Authorization: `Bearer ${session.access_token}`,
        };

        const [indRes, histRes, decRes] = await Promise.all([
          fetch("/api/financeiro/indicadores-avancados", { headers }),
          fetch("/api/cfo/historico-v2", { headers }),
          fetch("/api/financeiro/cfo/decisao", { headers }),
        ]);

        if (!indRes.ok) {
          throw new Error("Erro ao carregar indicadores");
        }

        const indJson = await indRes.json();
        setIndicadores(indJson.indicadores);

        if (histRes.ok) {
          const histJson = await histRes.json();
          setHistorico(histJson.historico ?? []);
        }

        if (decRes.ok) {
          const decJson = await decRes.json();
          setDecisao(decJson);
        }
      } catch (e) {
        console.error("Erro Dashboard CFO:", e);
        setErro("Falha ao carregar o CFO financeiro");
      } finally {
        setLoading(false);
      }
    }

    carregar();
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

      {/* DECISÃO AUTÔNOMA */}
      {decisao && (
        <BlocoDecisao decisao={decisao} />
      )}

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

      {/* HISTÓRICO */}
      <div>
        <h2 className="font-semibold mb-3">Histórico Financeiro</h2>

        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Mês</th>
              <th className="p-2 border">Receita</th>
              <th className="p-2 border">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((h, i) => (
              <tr key={i}>
                <td className="p-2 border">{h.mes_referencia}</td>
                <td className="p-2 border">{h.receita_bruta}</td>
                <td className="p-2 border">{h.resultado_operacional}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===============================
// COMPONENTES AUXILIARES
// ===============================
function KPI({ titulo, valor }: { titulo: string; valor: any }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-xl font-semibold">{valor}</p>
    </div>
  );
}

function BlocoDecisao({ decisao }: { decisao: DecisaoCFO }) {
  const cor =
    decisao.prioridade === "alta"
      ? "bg-red-200 text-red-800"
      : decisao.prioridade === "media"
      ? "bg-yellow-200 text-yellow-800"
      : "bg-green-200 text-green-800";

  return (
    <div className={`p-5 rounded-2xl ${cor}`}>
      <h2 className="font-bold text-lg mb-2">
        Decisão do CFO Autônomo
      </h2>
      <p>{decisao.decisao}</p>
    </div>
  );
}
