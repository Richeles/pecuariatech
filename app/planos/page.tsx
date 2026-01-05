// CAMINHO: app/planos/page.tsx
// Planos PecuariaTech — PAYWALL REAL (UX Premium)
// Next.js 16 + App Router

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Periodo = "mensal" | "trimestral" | "anual";

const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    frase:
      "Para quem quer sair do caderno, organizar a fazenda e ter clareza do que acontece no dia a dia.",
    descricao: [
      "Dashboard simples e intuitivo",
      "Controle básico de rebanho",
      "Controle essencial de pastagem",
      "Relatório mensal automático",
      "Indicadores operacionais iniciais",
      "Histórico simples da fazenda",
      "Base sólida para começar a gestão digital",
    ],
    precos: {
      mensal: 31.75,
      trimestral: 79.38,
      anual: 317.5,
    },
  },
  {
    id: "profissional",
    nome: "Profissional",
    frase:
      "Para o produtor que já se organiza, mas precisa entender melhor os números antes de decidir.",
    descricao: [
      "Tudo do plano Básico",
      "Relatórios mensais mais detalhados",
      "Exportação de dados (Excel)",
      "Indicadores financeiros iniciais",
      "Planilhas profissionais automatizadas",
      "Índice PecuariaTech de Performance (IPP)",
      "Alertas operacionais inteligentes",
      "Primeiro nível de apoio da IA",
    ],
    precos: {
      mensal: 52.99,
      trimestral: 132.48,
      anual: 529.9,
    },
  },
  {
    id: "ultra",
    nome: "Ultra",
    destaque: true,
    frase:
      "Para quem quer parar de reagir aos problemas e começar a decidir com apoio real de análises e inteligência.",
    descricao: [
      "Tudo do plano Profissional",
      "Relatórios premium automatizados",
      "Análises financeiras avançadas",
      "Diagnóstico mensal automático por IA",
      "IPP por lote e categoria",
      "Alertas de decisão (não apenas dados)",
      "Simulações simples de cenário",
      "Plano mais escolhido por produtores profissionais",
    ],
    precos: {
      mensal: 106.09,
      trimestral: 265.23,
      anual: 1060.9,
    },
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    frase:
      "Para operações maiores, com mais de uma fazenda ou equipe, que exigem padrão, controle e escala.",
    descricao: [
      "Tudo do plano Ultra",
      "Multi-fazendas e multi-usuários",
      "Gestão de equipes e permissões",
      "Relatórios personalizados",
      "Alertas automáticos avançados",
      "Diagnóstico contínuo por IA",
      "IPP consolidado por fazenda",
      "Suporte prioritário",
    ],
    precos: {
      mensal: 159.19,
      trimestral: 397.98,
      anual: 1591.9,
    },
  },
  {
    id: "premium_dominus",
    nome: "Premium Dominus 360°",
    frase:
      "Para quem pensa como dono, gestor ou investidor e precisa enxergar a fazenda como empresa.",
    descricao: [
      "Tudo do plano Empresarial",
      "IA completa (preditiva + diagnóstica)",
      "CFO Autônomo integrado ao dashboard",
      "Financeiro avançado (CAPEX / OPEX)",
      "EBITDA e EBIT automáticos",
      "Valuation para bancos, fundos e holdings",
      "Simulações financeiras completas",
      "Diagnóstico explicável (IA auditável)",
      "Suporte Ultra VIP",
      "Visão estratégica de longo prazo",
    ],
    precos: {
      mensal: 318.49,
      trimestral: 796.23,
      anual: 3184.9,
    },
  },
];

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const searchParams = useSearchParams();
  const bloqueado = searchParams.get("bloqueado") === "1";

  const preco = (v: number) =>
    `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-bold">
            Planos PecuariaTech
          </h1>
          <p className="text-gray-600">
            Cada plano foi pensado para uma realidade diferente no campo —
            do controle básico à gestão com IA e CFO Autônomo.
          </p>
        </header>

        {bloqueado && (
          <div className="mx-auto max-w-3xl rounded-xl border border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-800 text-center">
            Seu acesso ao sistema está bloqueado no momento.
            <br />
            Escolha um plano para continuar usando o PecuariaTech sem interrupções.
          </div>
        )}

        {/* TOGGLE PERÍODO */}
        <div className="flex justify-center gap-2">
          {(["mensal", "trimestral", "anual"] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                periodo === p
                  ? "bg-green-600 text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* PLANOS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {PLANOS.map((plano) => (
            <div
              key={plano.id}
              className={`bg-white rounded-xl shadow p-6 space-y-4 ${
                plano.destaque ? "border-2 border-green-600" : ""
              }`}
            >
              <h2 className="text-xl font-semibold">
                {plano.nome}
              </h2>

              <p className="text-sm text-gray-700 italic">
                {plano.frase}
              </p>

              <p className="text-3xl font-bold text-green-600">
                {preco(plano.precos[periodo])}
              </p>

              <ul className="text-sm text-gray-600 space-y-1">
                {plano.descricao.map((d) => (
                  <li key={`${plano.id}-${d}`}>✓ {d}</li>
                ))}
              </ul>

              <Link
                href={`/checkout?plano=${plano.id}&periodo=${periodo}`}
                className="block text-center bg-green-600 text-white py-2 rounded hover:opacity-90"
              >
                Assinar
              </Link>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
