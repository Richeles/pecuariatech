// CAMINHO: app/planos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/app/lib/supabaseClient";

// ===============================
// TIPOS
// ===============================
type Periodo = "mensal" | "trimestral" | "anual";

interface Plano {
  codigo: string;
  nome_exibicao: string;
  nivel_ordem: number;
  mensal: number;
  trimestral: number;
  anual: number;
}

// ===============================
// BENEFÍCIOS (FIXOS POR PLANO)
// ===============================
const BENEFICIOS: Record<string, string[]> = {
  basico: [
    "Dashboard simples e intuitivo",
    "Controle básico de rebanho",
    "Controle essencial de pastagem",
    "Relatório mensal automático",
    "Indicadores operacionais iniciais",
    "Histórico simples da fazenda",
    "Ideal para sair do caderno e começar certo",
  ],
  profissional: [
    "Tudo do plano Básico",
    "Relatórios mensais avançados",
    "Exportação de dados (Excel)",
    "Indicadores financeiros iniciais",
    "Planilhas profissionais automatizadas",
    "Índice PecuariaTech de Performance (IPP)",
    "Alertas operacionais inteligentes",
    "Suporte via Telegram",
    "Para entender números antes de decidir",
  ],
  ultra: [
    "Tudo do plano Profissional",
    "Relatórios premium automatizados",
    "Análises financeiras avançadas",
    "Diagnóstico mensal automático",
    "IPP por lote e categoria",
    "Alertas de decisão (não só dados)",
    "Simulação básica de cenários",
    "Integrações inteligentes de manejo",
    "Plano mais escolhido por profissionais",
  ],
  empresarial: [
    "Tudo do plano Ultra",
    "Multi-fazendas e multi-usuários",
    "Gestão de equipes e permissões",
    "Relatórios personalizados",
    "Alertas automáticos avançados",
    "Diagnóstico contínuo por IA",
    "IPP consolidado por fazenda",
    "Suporte prioritário",
    "Para operações estruturadas",
  ],
  premium_dominus: [
    "Tudo do plano Empresarial",
    "IA completa (preditiva + diagnóstica)",
    "UltraBiológica 360°",
    "Financeiro avançado (CAPEX / OPEX)",
    "EBITDA e EBIT automáticos",
    "Valuation para fundos e holdings",
    "Benchmark regional e histórico",
    "Simulador financeiro completo",
    "Diagnóstico explicável (IA auditável)",
    "Suporte Ultra VIP",
    "Visão de dono e investidor",
  ],
};

// ===============================
// COMPONENTE
// ===============================
export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // ===============================
  // CHECKOUT SEGURO (CLIENT)
  // ===============================
  async function assinar(planoCodigo: string) {
    try {
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: planoCodigo }),
      });

      const data = await res.json();

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao iniciar pagamento.");
        console.error("Checkout sem init_point:", data);
      }
    } catch (err) {
      console.error("Erro no checkout:", err);
      alert("Erro de conexão com o checkout.");
    }
  }

  // ===============================
  // CARREGAR PLANOS (FONTE Y + LOG)
  // ===============================
  useEffect(() => {
    async function carregarPlanos() {
      setLoading(true);
      setErro(null);

      const { data, error } = await supabaseClient
        .from("planos_precos_view")
        .select("*")
        .order("nivel_ordem", { ascending: true });

      console.group("DEBUG /planos");
      console.log("DATA:", data);
      console.log("ERROR:", error);
      console.groupEnd();

      if (error) {
        setErro(error.message || "Erro ao consultar planos.");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setErro("Nenhum plano encontrado.");
        setLoading(false);
        return;
      }

      setPlanos(data as Plano[]);
      setLoading(false);
    }

    carregarPlanos();
  }, []);

  // ===============================
  // RENDER
  // ===============================
  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Carregando planos…
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-10 text-red-600">
        {erro}
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Planos PecuariaTech</h1>

      {/* SELETOR DE PERÍODO (VISUAL) */}
      <div className="flex gap-3">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded font-semibold ${
              periodo === p
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <section className="grid md:grid-cols-5 gap-6">
        {planos.map((plano) => (
          <div
            key={plano.codigo}
            className={`rounded-xl p-6 shadow bg-white border ${
              plano.codigo === "ultra"
                ? "border-yellow-400 border-4"
                : "border-gray-200"
            }`}
          >
            {plano.codigo === "ultra" && (
              <div className="text-xs font-bold text-yellow-600 mb-2">
                ⭐ RECOMENDADO
              </div>
            )}

            <h2 className="text-xl font-bold mb-3">
              {plano.nome_exibicao}
            </h2>

            <ul className="text-sm space-y-1 mb-4">
              {BENEFICIOS[plano.codigo]?.map((b, i) => (
                <li key={i}>✓ {b}</li>
              ))}
            </ul>

            <p className="text-2xl font-bold text-green-700 mb-4">
              R$ {plano[periodo].toFixed(2)}
            </p>

            <button
              onClick={() => assinar(plano.codigo)}
              className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90"
            >
              Assinar
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
