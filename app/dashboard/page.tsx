// app/dashboard/page.tsx
// Next.js 16 + TypeScript strict
// Dashboard responsivo + KPIs reais

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type KPIs = {
  totalAnimais: number;
  pesoMedio: string;
  ganhoMedio: string;
  custoMedio: string;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // VINCULAR ASSINATURA AO USUÁRIO
  // ===============================
  useEffect(() => {
    const vincularAssinatura = async () => {
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

    vincularAssinatura();
  }, []);

  // ===============================
  // BUSCAR KPIs REAIS
  // ===============================
  useEffect(() => {
    const carregarKPIs = async () => {
      try {
        const res = await fetch("/api/dashboard/kpis");
        const data = await res.json();
        setKpis(data);
      } catch (err) {
        console.error("Erro ao carregar KPIs:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarKPIs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="w-full bg-white shadow px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          PecuariaTech
        </h1>

        <button className="md:hidden text-sm font-medium">
          ☰
        </button>
      </header>

      {/* ================= CONTEÚDO ================= */}
      <div className="flex flex-1">
        {/* ===== SIDEBAR (DESKTOP) ===== */}
        <aside className="hidden md:flex md:w-64 bg-white shadow-sm flex-col p-4">
          <nav className="space-y-3">
            <a className="font-medium">Dashboard</a>
            <a className="text-gray-600">Rebanho</a>
            <a className="text-gray-600">Financeiro</a>
            <a className="text-gray-600">Relatórios</a>
          </nav>
        </aside>

        {/* ===== ÁREA PRINCIPAL ===== */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              titulo="Total de Animais"
              valor={
                loading ? "—" : kpis?.totalAnimais ?? "0"
              }
            />
            <KpiCard
              titulo="Peso Médio (kg)"
              valor={
                loading ? "—" : kpis?.pesoMedio ?? "0"
              }
            />
            <KpiCard
              titulo="Ganho Médio Diário"
              valor={
                loading ? "—" : kpis?.ganhoMedio ?? "0"
              }
            />
            <KpiCard
              titulo="Custo Médio (R$)"
              valor={
                loading ? "—" : kpis?.custoMedio ?? "0"
              }
            />
          </section>

          {/* Área futura */}
          <section className="bg-white p-6 rounded shadow min-h-[200px]">
            <p className="text-gray-500">
              Gráficos e análises avançadas
            </p>
          </section>
        </main>
      </div>
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
      <p className="text-sm text-gray-500">
        {titulo}
      </p>
      <p className="text-2xl font-bold">
        {valor}
      </p>
