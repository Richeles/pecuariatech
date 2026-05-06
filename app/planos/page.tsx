"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

type Periodo = "mensal" | "trimestral" | "anual";

export default function PlanosClient() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");

  function calcularPreco(valorMensal: number, periodo: Periodo) {
    if (periodo === "mensal") return valorMensal;
    if (periodo === "trimestral") return valorMensal * 3 * 0.95;
    if (periodo === "anual") return valorMensal * 12 * 0.8;
    return valorMensal;
  }

  async function handleCheckout(planoId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      window.location.href = "/login";
      return;
    }

    const res = await fetch("/api/checkout/preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plano: planoId,
        periodo,
        email: session.user.email,
        user_id: session.user.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Erro no checkout");
      return;
    }

    window.location.href = data.init_point;
  }

  const planos = [
    {
      id: "basico",
      nome: "Básico",
      descricao:
        "Para quem quer sair do caderno, organizar a fazenda e ter clareza do dia a dia.",
      mensal: 149.9,
      features: [
        "Dashboard simples e intuitivo",
        "Controle básico de rebanho",
        "Controle essencial de pastagem",
        "Relatório mensal automático",
        "Indicadores operacionais iniciais",
        "Base sólida para começar a gestão digital",
      ],
    },
    {
      id: "profissional",
      nome: "Profissional",
      descricao:
        "Para o produtor que já se organiza, mas precisa entender melhor os números.",
      mensal: 247.9,
      features: [
        "Tudo do plano Básico",
        "Relatórios mensais avançados",
        "Exportação de dados (Excel)",
        "Indicadores financeiros iniciais",
        "Planilhas profissionais automatizadas",
        "Alertas operacionais inteligentes",
      ],
    },
    {
      id: "ultra",
      nome: "Ultra",
      destaque: true,
      descricao:
        "Para quem quer parar de reagir e começar a decidir com apoio de IA.",
      mensal: 452.9,
      features: [
        "Tudo do plano Profissional",
        "Relatórios premium automatizados",
        "Análises financeiras avançadas",
        "Diagnóstico mensal por IA",
        "Alertas de decisão",
        "Plano mais escolhido por produtores",
      ],
    },
    {
      id: "empresarial",
      nome: "Empresarial",
      descricao:
        "Para operações maiores que exigem controle, padrão e escala.",
      mensal: 627.9,
      features: [
        "Tudo do plano Ultra",
        "Multi-fazendas e multi-usuários",
        "Gestão de equipes",
        "Relatórios personalizados",
        "Alertas automáticos avançados",
      ],
    },
    {
      id: "premium_dominus",
      nome: "Premium Dominus 360°",
      descricao:
        "Para quem pensa como dono ou investidor e precisa enxergar a fazenda como empresa.",
      mensal: 789.9,
      features: [
        "Tudo do plano Empresarial",
        "CFO Autônomo integrado",
        "IA preditiva e diagnóstica",
        "EBITDA e EBIT automáticos",
        "Valuation e simulações financeiras",
        "Suporte Ultra VIP",
      ],
    },
  ];

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-center">
        Planos PecuariaTech
      </h2>

      <p className="text-center text-gray-600 mt-2">
        Escolha o melhor plano para sua operação
      </p>

      <div className="flex justify-center gap-2 mt-6">
        {["mensal", "trimestral", "anual"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p as Periodo)}
            className={`px-4 py-2 rounded ${
              periodo === p
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-10">
        {planos.map((plano) => {
          const preco = calcularPreco(plano.mensal, periodo);

          return (
            <div
              key={plano.id}
              className={`rounded-xl border p-6 shadow ${
                plano.destaque
                  ? "border-green-600 scale-105"
                  : ""
              }`}
            >
              <h3 className="text-xl font-semibold">
                {plano.nome}
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                {plano.descricao}
              </p>

              <p className="text-3xl font-bold text-green-600 mt-4">
                R$ {preco.toFixed(2)}
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                {plano.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plano.id)}
                className="mt-6 w-full bg-green-600 text-white py-2 rounded"
              >
                Assinar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}