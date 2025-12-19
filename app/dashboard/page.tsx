// app/dashboard/page.tsx
// Next.js 16 + TypeScript strict
// Dashboard responsivo (mobile, tablet, desktop)

"use client";

import { useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

export default function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="w-full bg-white shadow px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          PecuariaTech
        </h1>

        {/* Menu Mobile */}
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
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">
                Total de Animais
              </p>
              <p className="text-2xl font-bold">
                —
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">
                Peso Médio
              </p>
              <p className="text-2xl font-bold">
                —
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">
                Ganho Diário
              </p>
              <p className="text-2xl font-bold">
                —
              </p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">
                Custo Médio
              </p>
              <p className="text-2xl font-bold">
                —
              </p>
            </div>
          </section>

          {/* Gráfico / Conteúdo futuro */}
          <section className="bg-white p-6 rounded shadow min-h-[200px]">
            <p className="text-gray-500">
              Área de gráficos (responsiva)
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
