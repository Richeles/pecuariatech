"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

// ============================================================
// PLANOS DISPONÍVEIS
// ============================================================
const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    preco: 189.97,
    descricao:
      "Dashboard simples e intuitivo, controle básico de rebanho, controle essencial de pastagem, relatório mensal automático.",
    beneficios: ["Dashboard simples", "Controle básico de rebanho", "Controle essencial de pastagem", "Relatório mensal"],
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco: 389.97,
    descricao:
      "Relatórios avançados, exportação Excel, indicadores financeiros, alertas inteligentes.",
    beneficios: ["Relatórios avançados", "Exportação Excel", "Indicadores financeiros", "Alertas inteligentes"],
  },
  {
    id: "ultra",
    nome: "Ultra",
    preco: 589.97,
    descricao:
      "IA operacional, análises avançadas, alertas estratégicos, motor analítico.",
    beneficios: ["IA operacional", "Análises avançadas", "Alertas estratégicos", "Motor analítico"],
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    preco: 789.97,
    descricao:
      "Gestão de equipes, governança operacional, relatórios personalizados, multioperações.",
    beneficios: ["Gestão de equipes", "Governança operacional", "Relatórios personalizados", "Multioperações"],
  },
  {
    id: "dominus",
    nome: "Dominus 360°",
    preco: 989.97,
    descricao:
      "CFO Autônomo, IA preditiva, relatórios financeiros, suporte prioritário.",
    beneficios: ["CFO Autônomo", "IA preditiva", "Relatórios financeiros", "Suporte prioritário"],
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function PlanoClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [planoAtual, setPlanoAtual] = useState<string | null>(null);

  // ============================================================
  // CARREGAR USUÁRIO E PLANO ATUAL
  // ============================================================
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function loadPlano() {
      if (!user?.id) return;
      const res = await fetch(`/api/assinaturas/status?ts=${Date.now()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data?.plano) {
        setPlanoAtual(data.plano);
      }
    }
    if (user?.id) loadPlano();
  }, [user]);

  // ============================================================
  // HANDLE ASSINAR
  // ============================================================
  const handleAssinar = async (plano: string) => {
    if (!user) {
      alert("Faça login para assinar um plano");
      window.location.href = "/pt/login";
      return;
    }

    setLoading(plano);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano,
          user_id: user.id,
          email: user.email,
          nome: user.user_metadata?.nome || user.email?.split("@")[0],
        }),
      });

      const data = await res.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao iniciar checkout: " + (data.error || "Tente novamente"));
        setLoading(null);
      }
    } catch (error) {
      console.error("Erro ao assinar:", error);
      alert("Erro ao processar assinatura. Tente novamente.");
      setLoading(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            Planos PecuariaTech
          </h1>
          <p className="text-[#A7F3D0]/60 max-w-2xl mx-auto">
            Cada plano foi pensado para uma realidade diferente no campo — do
            controle básico à gestão com IA operacional, CFO Autônomo e
            inteligência estratégica integrada.
          </p>
          {planoAtual && (
            <p className="mt-3 text-sm text-[#34D399]">
              Plano atual: <span className="font-bold uppercase">{planoAtual}</span>
            </p>
          )}
        </div>

        {/* GRID DE PLANOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {PLANOS.map((p) => {
            const isActive = planoAtual === p.id;
            const isUpgrade =
              planoAtual &&
              PLANOS.findIndex((x) => x.id === p.id) >
                PLANOS.findIndex((x) => x.id === planoAtual);

            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-6 shadow-xl transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? "border-[#34D399] bg-[#1A3F2A]/80 ring-2 ring-[#34D399]/50"
                    : "border-[#34D399]/20 bg-[#1A3F2A]/60 hover:border-[#34D399]/40"
                }`}
              >
                {/* NOME */}
                <h2 className="text-2xl font-bold text-white">{p.nome}</h2>

                {/* DESCRIÇÃO */}
                <p className="text-[#A7F3D0]/60 text-sm mt-2 h-16">
                  {p.descricao}
                </p>

                {/* PREÇO */}
                <div className="my-4">
                  <span className="text-3xl font-bold text-white">
                    R$ {p.preco.toFixed(2)}
                  </span>
                  <span className="text-[#A7F3D0]/40 text-sm ml-1">/ mês</span>
                </div>

                {/* BENEFÍCIOS */}
                <ul className="space-y-2 mb-6">
                  {p.beneficios.map((b) => (
                    <li key={b} className="text-sm text-[#A7F3D0]/70 flex items-center gap-2">
                      <span className="text-[#34D399]">✅</span> {b}
                    </li>
                  ))}
                </ul>

                {/* BOTÃO */}
                {isActive ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-[#34D399]/20 text-[#34D399] font-bold cursor-default border border-[#34D399]/30"
                  >
                    ✓ Plano Atual
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleAssinar(p.id)}
                    disabled={loading === p.id}
                    className="w-full py-3 rounded-xl bg-[#FBBF24] text-[#0F2A1A] font-bold hover:bg-[#F59E0B] transition disabled:opacity-50"
                  >
                    {loading === p.id ? "⏳ Processando..." : "⬆ Fazer Upgrade"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssinar(p.id)}
                    disabled={loading === p.id}
                    className="w-full py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50"
                  >
                    {loading === p.id ? "⏳ Processando..." : "Assinar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* RODAPÉ */}
        <div className="mt-12 text-center text-xs text-[#A7F3D0]/30">
          <p>Os planos são renovados automaticamente a cada mês.</p>
          <p>É possível cancelar ou alterar o plano a qualquer momento.</p>
        </div>
      </div>
    </div>
  );
}