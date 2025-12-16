"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Periodo = "mensal" | "trimestral" | "anual";

interface Plano {
  codigo: string;
  nome_exibicao: string;
  nivel_ordem: number;
  mensal: number;
  trimestral: number;
  anual: number;
}

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

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarPlanos() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from("planos_precos_view")
          .select("*")
          .order("nivel_ordem", { ascending: true });

        if (error) throw error;
        setPlanos(data as Plano[]);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar os planos.");
      } finally {
        setLoading(false);
      }
    }

    carregarPlanos();
  }, []);

  if (loading) {
    return <div className="p-10 text-white">Carregando planos...</div>;
  }

  if (erro) {
    return <div className="p-10 text-red-300">{erro}</div>;
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Planos PecuariaTech</h1>

      {/* PERÍODO */}
      <div className="flex gap-3 mb-8">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded ${
              periodo === p ? "bg-green-600" : "bg-white text-black"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-5 gap-6">
        {planos.map(plano => (
          <div
            key={plano.codigo}
            className={`bg-white text-black rounded-xl p-6 shadow ${
              plano.codigo === "ultra"
                ? "border-4 border-yellow-400"
                : "border"
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

            <button className="w-full bg-green-600 text-white py-2 rounded">
              Assinar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
