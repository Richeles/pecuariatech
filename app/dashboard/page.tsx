// app/dashboard/page.tsx
// Next.js 16 + TypeScript strict
// Dashboard + KPIs + Planos + Planilhas + IA UltraBiológica + Telegram

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// 🔥 IMPORTS CORRETOS PARA LINUX / VERCEL
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

// ===============================
// CONFIG TEMPORÁRIA
// ===============================
const LOTE_PADRAO = "00000000-0000-0000-0000-000000000001";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [plano, setPlano] = useState<string>("trial");
  const [recursos, setRecursos] = useState<Recursos | null>(null);
  const [iaLote, setIaLote] = useState<IALote | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [telegramConectado, setTelegramConectado] = useState(false);
  const [conectandoTelegram, setConectandoTelegram] = useState(false);

  // ===============================
  // VINCULAR ASSINATURA
  // ===============================
  useEffect(() => {
    const vincular = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      await fetch("/api/assinaturas/vincular", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    };

    vincular();
  }, []);

  // ===============================
  // PLANO + RECURSOS
  // ===============================
  useEffect(() => {
    const carregarPlano = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

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
  // IA ULTRABIOLÓGICA (LOTE)
  // ===============================
  useEffect(() => {
    const carregarIA = async () => {
      if (!recursos?.ia) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const res = await fetch(`/api/ia/lote/${LOTE_PADRAO}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setIaLote(data);
    };

    carregarIA();
  }, [recursos]);

  // ===============================
  // CONECTAR TELEGRAM
  // ===============================
  const conectarTelegram = async () => {
    try {
      setConectandoTelegram(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Usuário não autenticado");
        return;
      }

      const res = await fetch("/api/telegram/link", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        alert("Erro ao gerar link do Telegram");
        return;
      }

      const data = await res.json();

      if (!data.link) {
        alert("Link do Telegram inválido");
        return;
      }

      window.open(data.link, "_blank");
      setTelegramConectado(true);
    } catch (err) {
      console.error("Erro Telegram:", err);
      alert("Falha ao conectar Telegram");
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

      const {
        data: { session },
      } = await supabase.auth.getSession();

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
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow px-4 py-3">
        <h1 className="text-lg font-semibold">PecuariaTech</h1>
        <p className="text-xs text-gray-500">
          Plano ativo:{" "}
          <span className="font-medium capitalize">{plano}</span>
        </p>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            titulo="Total de Animais"
            valor={loading ? "—" : kpis?.totalAnimais ?? "0"}
          />
          <KpiCard
            titulo="Peso Médio (kg)"
            valor={loading ? "—" : kpis?.pesoMedio ?? "0"}
          />
          <KpiCard
            titulo="Ganho Médio Diário"
            valor={loading ? "—" : kpis?.ganhoMedio ?? "0"}
          />
          <KpiCard
            titulo="Custo Médio (R$)"
            valor={loading ? "—" : kpis?.custoMedio ?? "0"}
          />
        </section>

        {/* PLANILHA */}
        <section className="bg-white p-6 rounded shadow flex justify-between">
          <div>
            <h2 className="font-semibold">Planilha do Rebanho</h2>
            <p className="text-sm text-gray-600">
              Exportação dos dados em CSV.
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

        {/* IA ULTRABIOLÓGICA */}
        {recursos?.ia && iaLote && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">
              Diagnóstico Inteligente
            </h2>

            <IACardLote
              loteId={iaLote.lote_id}
              status={iaLote.status}
              score={iaLote.score_ultrabiologico}
              alerta={iaLote.alerta}
              recomendacao={iaLote.recomendacao}
            />
          </section>
        )}

        {/* TELEGRAM */}
        {recursos?.ia && (
          <section className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold mb-2">
              Alertas via Telegram
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Receba alertas automáticos da IA UltraBiológica.
            </p>

            <button
              onClick={conectarTelegram}
              disabled={conectandoTelegram}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {telegramConectado
                ? "Telegram Conectado"
                : conectandoTelegram
                ? "Conectando..."
                : "Conectar Telegram"}
            </button>
          </section>
        )}

        {/* RECURSOS */}
        {recursos && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RecursoCard
              titulo="IA Analítica"
              descricao="Orientação técnica automática."
              ativo={recursos.ia}
            />
            <RecursoCard
              titulo="Planilhas Automáticas"
              descricao="Relatórios e CSV."
              ativo={recursos.planilhas}
            />
            <RecursoCard
              titulo="Dispositivos & Sensores"
              descricao="Integrações de campo."
              ativo={recursos.dispositivos}
            />
          </section>
        )}
      </main>
    </div>
  );
}

// ===============================
// KPI CARD
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
