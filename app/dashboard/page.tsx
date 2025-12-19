// CAMINHO: app/dashboard/page.tsx
// Next.js 16 + TypeScript strict
// Dashboard Real — Campo-first
// KPIs + HARVAN (decisão do dia) + IA + Planilhas + Telegram

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

// IMPORTS CORRETOS (LINUX / VERCEL)
import RecursoCard from "../../components/recursos/RecursoCard";
import IACardLote from "../../components/ia/IACardLote";

// ===============================
// TIPOS
// ===============================
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

type IALote = {
  lote_id: string;
  status: "adequado" | "atencao" | "critico";
  score_ultrabiologico: number;
  alerta?: string | null;
  recomendacao: string;
};

type HarvanDecisao = {
  severidade: "ok" | "atencao" | "critico";
  diagnostico: string;
  recomendacao: string;
  impacto_financeiro: number;
  confianca: number;
};

// ===============================
// CONFIG TEMPORÁRIA
// ===============================
const LOTE_PADRAO = "00000000-0000-0000-0000-000000000001";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [plano, setPlano] = useState<string>("trial");
  const [recursos, setRecursos] = useState<Recursos | null>(null);
  const [iaLote, setIaLote] = useState<IALote | null>(null);
  const [harvan, setHarvan] = useState<HarvanDecisao | null>(null);

  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [telegramConectado, setTelegramConectado] = useState(false);
  const [conectandoTelegram, setConectandoTelegram] = useState(false);

  // ===============================
  // VINCULAR ASSINATURA (SAFE)
  // ===============================
  useEffect(() => {
    const vincular = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return;

      await fetch("/api/assinaturas/vincular", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
    };
    vincular();
  }, []);

  // ===============================
  // PLANO + RECURSOS
  // ===============================
  useEffect(() => {
    const carregarPlano = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return;

      const res = await fetch("/api/assinaturas/plano", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      const json = await res.json();
      setPlano(json.plano);
      setRecursos(json.recursos);
    };
    carregarPlano();
  }, []);

  // ===============================
  // KPIs
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
  // HARVAN — DECISÃO DO DIA
  // ===============================
  useEffect(() => {
    const carregarHarvan = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return;

      const res = await fetch("/api/harvan/dashboard", {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      if (!res.ok) return;
      const json = await res.json();
      setHarvan(json);
    };
    carregarHarvan();
  }, []);

  // ===============================
  // IA ULTRABIOLÓGICA
  // ===============================
  useEffect(() => {
    const carregarIA = async () => {
      if (!recursos?.ia) return;

      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return;

      const res = await fetch(`/api/ia/lote/${LOTE_PADRAO}`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (!res.ok) return;
      const json = await res.json();
      setIaLote(json);
    };
    carregarIA();
  }, [recursos]);

  // ===============================
  // TELEGRAM
  // ===============================
  const conectarTelegram = async () => {
    try {
      setConectandoTelegram(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return;

      const res = await fetch("/api/telegram/link", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (!res.ok) return;
      const json = await res.json();

      if (json?.link) {
        window.open(json.link, "_blank");
        setTelegramConectado(true);
      }
    } finally {
      setConectandoTelegram(false);
    }
  };

  // ===============================
  // EXPORTAÇÃO CSV
  // ===============================
  const exportarPlanilha = async () => {
    try {
      setExportando(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return;

      const res = await fetch("/api/planilhas/rebanho", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "rebanho.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportando(false);
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow px-4 py-3">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-xs text-gray-500">
          Plano ativo: <span className="font-medium capitalize">{plano}</span>
        </p>
      </header>

      <main className="p-4 md:p-6 space-y-6">
        {/* HARVAN */}
        <section className="bg-white p-5 rounded shadow border-l-4 border-green-600">
          <h2 className="font-semibold mb-1">🧠 Harvan — O que importa hoje</h2>

          {harvan ? (
            <>
              <p className="text-sm text-gray-700">{harvan.diagnostico}</p>
              <p className="text-sm font-medium text-green-700 mt-1">
                👉 {harvan.recomendacao}
              </p>

              {harvan.impacto_financeiro !== 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Impacto estimado: R$ {harvan.impacto_financeiro.toFixed(2)}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Harvan está analisando os dados do dia…
            </p>
          )}
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard titulo="Total de Animais" valor={loading ? "—" : kpis?.totalAnimais ?? "0"} />
          <KpiCard titulo="Peso Médio (kg)" valor={loading ? "—" : kpis?.pesoMedio ?? "0"} />
          <KpiCard titulo="Ganho Diário" valor={loading ? "—" : kpis?.ganhoMedio ?? "0"} />
          <KpiCard titulo="Custo Médio (R$)" valor={loading ? "—" : kpis?.custoMedio ?? "0"} />
        </section>

        {/* PLANILHAS */}
        <section className="bg-white p-6 rounded shadow flex justify-between items-center">
          <div>
            <h2 className="font-semibold">Planilha do Rebanho</h2>
            <p className="text-sm text-gray-600">
              Exportação CSV explicável.
            </p>
          </div>

          {recursos?.planilhas ? (
            <button
              onClick={exportarPlanilha}
              disabled={exportando}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {exportando ? "Exportando..." : "Exportar"}
            </button>
          ) : (
            <a href="/planos" className="text-blue-600">
              Fazer upgrade
            </a>
          )}
        </section>

        {/* IA */}
        {recursos?.ia && iaLote && (
          <section>
            <h2 className="text-lg font-semibold mb-2">
              Diagnóstico UltraBiológico
            </h2>
            <IACardLote {...iaLote} />
          </section>
        )}

        {/* TELEGRAM */}
        {recursos?.ia && (
          <section className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold mb-2">Alertas via Telegram</h2>
            <button
              onClick={conectarTelegram}
              disabled={conectandoTelegram}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {telegramConectado ? "Telegram Conectado" : "Conectar Telegram"}
            </button>
          </section>
        )}

        {/* RECURSOS */}
        {recursos && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RecursoCard titulo="IA Analítica" descricao="Decisão técnica automática." ativo={recursos.ia} />
            <RecursoCard titulo="Planilhas Inteligentes" descricao="Financeiro explicável." ativo={recursos.planilhas} />
            <RecursoCard titulo="Sensores & GPS" descricao="Integração campo." ativo={recursos.dispositivos} />
          </section>
        )}
      </main>
    </div>
  );
}

// ===============================
// KPI CARD
// ===============================
function KpiCard({ titulo, valor }: { titulo: string; valor: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}
