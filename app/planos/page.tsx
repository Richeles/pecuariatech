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

/* 🔒 Benefícios por plano (modelo antigo aprovado)
   Isso é APENAS apresentação, não altera Equação Y */
const beneficios: Record<string, string[]> = {
  basico: [
    "Dashboard simples",
    "Controle de rebanho",
    "Controle de pastagem",
    "Relatório mensal básico",
  ],
  profissional: [
    "Tudo do plano Básico",
    "Relatórios mensais avançados",
    "Exportação de dados (Excel)",
    "Indicadores financeiros iniciais",
    "Planilhas profissionais",
    "Suporte via Telegram",
  ],
  ultra: [
    "Tudo do plano Profissional",
    "Relatórios premium automatizados",
    "Análises financeiras avançadas",
    "Suporte estratégico",
    "Integrações inteligentes",
  ],
  empresarial: [
    "Tudo do plano Ultra",
    "Multi-fazendas e multi-usuários",
    "Gestão de equipes",
    "Relatórios personalizados",
    "Alertas automáticos",
    "Suporte prioritário",
  ],
  premium_dominus: [
    "Tudo do plano Empresarial",
    "IA completa (predição e diagnóstico)",
    "UltraBiológica 360°",
    "Financeiro avançado (CAPEX / OPEX)",
    "EBITDA e EBIT automáticos",
    "Valuation para fundos e holdings",
    "Suporte Ultra VIP",
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
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Variáveis do Supabase não configuradas");
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase
          .from("planos_precos_view")
          .select("*")
          .order("nivel_ordem", { ascending: true });

        if (error) throw error;

        setPlanos(data as Plano[]);
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
        setErro("Não foi possível carregar os planos no momento.");
      } finally {
        setLoading(false);
      }
    }

    carregarPlanos();
  }, []);

  if (loading) {
    return <div className="p-10 text-white">Carregando planos…</div>;
  }

  if (erro) {
    return <div className="p-10 text-red-400">{erro}</div>;
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Planos PecuariaTech</h1>

      {/* Período */}
      <div className="flex gap-3 mb-8">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded font-semibold ${
              periodo === p
                ? "bg-green-600 text-white"
                : "bg-white text-black"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-5 gap-6">
        {planos.map((plano) => (
          <div
            key={plano.codigo}
            className="bg-white text-black rounded-xl p-6 shadow flex flex-col"
          >
            {/* Nome */}
            <h2 className="text-xl font-bold mb-3">
              {plano.nome_exibicao}
            </h2>

            {/* O QUE ENTREGA (MODELO ANTIGO) */}
            <ul className="text-sm mb-4 space-y-1">
              {beneficios[plano.codigo]?.map((item, idx) => (
                <li key={idx}>✓ {item}</li>
              ))}
            </ul>

            {/* Preço */}
            <div className="text-3xl font-bold text-green-700 mb-4">
              R$ {plano[periodo].toFixed(2)}
            </div>

            {/* Botão */}
            <button className="mt-auto w-full bg-green-600 text-white py-2 rounded">
              Assinar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
