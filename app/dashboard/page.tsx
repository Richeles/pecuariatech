// app/dashboard/page.tsx
// Next.js 16 + TypeScript strict
// Dashboard responsivo + KPIs + Plano ativo + Recursos + Planilhas

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import RecursoCard from "@/app/components/recursos/RecursoCard";

type KPIs = {
  totalAnimais: number;
  pesoMedio: string;
  ganhoMedio: string;
  custoMedio: string;
};

type Recursos = {
  kpisBasicos: boolean;
  kpisAvancados: boolean;
  planilhas: boolean;
  ia: boolean;
  dispositivos: boolean;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [plano, setPlano] = useState<string>("trial");
  const [recursos, setRecursos] = useState<Recursos | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  // ===============================
  // VINCULAR ASSINATURA AO USUÁRIO
  // ===============================
  useEffect(() => {
    const vincularAssinatura = async () => {
      const { data: { session } } =
        await supabase.auth.getSession();

      if (!session?.access_token) return;

      await fetch("/api/assinaturas/vincular", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    };

    vincularAssinatura();
  }, []);

  // ===============================
  // BUSCAR PLANO ATIVO + RECURSOS
  // ===============================
  useEffect(() => {
    const carregarPlano = async () => {
      const { data: { session } } =
        await supabase.auth.getSession();

      if (!session?.access_token) return;

      const res = await fetch("/api/assinaturas/plano", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      setPlano(data.plano);
      setRecursos(data.recursos);
    };

    carregarPlano();
  }, []);

  // ===============================
  // BUSCAR KPIs
  // ===============================
  useEffect(() => {
    const carregarKPIs = async () => {
      try {
        const res = await fetch("/api/dashboard/kpis");
        const data = await res.json();
        setKpis(data);
      } catch (err) {
        console.error("Erro KPIs:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarKPIs();
  }, []);

  // ===============================
  // EXPORTAR PLANILHA (CSV)
  // ===============================
  const exportarPlanilha = async () => {
    try {
      setExportando(true);

      const { data: { session } } =
        await supabase.auth.getSession();

      if (!session?.access_token) return;

      const res = await fetch("/api/planilhas/rebanho", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        alert("Seu plano não permite exportação.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "rebanho.csv";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro exportação:", err);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="w-full bg-white shadow px-4 py-3">
        <h1 className="text-lg font-semibold">
          PecuariaTech
        </h1>
        <p className="text-xs text-gray-500">
          Plano ativo:{" "}
          <span className="font-medium capitalize">
            {plano}
          </span>
        </p>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard titulo="Total de Animais" valor={loading ? "—" : kpis?.totalAnimais ?? "0"} />
          <KpiCard titulo="Peso Médio (kg)" valor={loading ? "—" : kpis?.pesoMedio ?? "0"} />
          <KpiCard titulo="Ganho Médio Diário" valor={loading ? "—" : kpis?.ganhoMedio ?? "0"} />
          <KpiCard titulo="Custo Médio (R$)" valor={loading ? "—" : kpis?.custoMedio ?? "0"} />
        </section>

        {/* EXPORTAÇÃO DE PLANILHA */}
        <section className="bg-white p-6 rounded shadow flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h2 className="font-semibold">
              Planilha do Rebanho
            </h2>
            <p className="text-sm text-gray-600">
              Exportação dos dados em CSV.
            </p>
          </div>

          {recursos?.planilhas ? (
            <button
              onClick={exportarPlanilha}
              disabled={exportando}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {exportando ? "Exportando..." : "Exportar Planilha"}
            </button>
          ) : (
            <a href="/planos" className="text-blue-600 font-medium">
              Fazer upgrade
            </a>
          )}
        </section>

        {/* RECURSOS AVANÇADOS */}
        {recursos && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RecursoCard titulo="IA Analítica" descricao="Análises inteligentes do rebanho." ativo={recursos.ia} />
            <RecursoCard titulo="Planilhas Automáticas" descricao="Relatórios e exportações." ativo={recursos.planilhas} />
            <RecursoCard titulo="Dispositivos & Sensores" descricao="Integração com sensores e GPS." ativo={recursos.dispositivos} />
          </section>
        )}
      </main>
    </div>
  );
}

// ===============================
// COMPONENTE KPI
// ===============================
function KpiCard({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string | number;
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}
