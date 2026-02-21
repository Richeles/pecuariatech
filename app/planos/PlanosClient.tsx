"use client";

// CAMINHO: app/planos/PlanosClient.tsx
// Planos PecuariaTech — UX Premium (Client Component)

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase-browser";

type Periodo = "mensal" | "trimestral" | "anual";

const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    frase:
      "Para quem quer sair do caderno, organizar a fazenda e ter clareza do dia a dia.",
    descricao: [
      "Dashboard simples e intuitivo",
      "Controle básico de rebanho",
      "Controle essencial de pastagem",
      "Relatório mensal automático",
      "Indicadores operacionais iniciais",
      "Base sólida para começar a gestão digital",
    ],
    precos: { mensal: 31.75, trimestral: 79.38, anual: 317.5 },
  },
  {
    id: "profissional",
    nome: "Profissional",
    frase:
      "Para o produtor que já se organiza, mas precisa entender melhor os números.",
    descricao: [
      "Tudo do plano Básico",
      "Relatórios mensais avançados",
      "Exportação de dados (Excel)",
      "Indicadores financeiros iniciais",
      "Planilhas profissionais automatizadas",
      "Alertas operacionais inteligentes",
    ],
    precos: { mensal: 52.99, trimestral: 132.48, anual: 529.9 },
  },
  {
    id: "ultra",
    nome: "Ultra",
    destaque: true,
    frase:
      "Para quem quer parar de reagir e começar a decidir com apoio de IA.",
    descricao: [
      "Tudo do plano Profissional",
      "Relatórios premium automatizados",
      "Análises financeiras avançadas",
      "Diagnóstico mensal por IA",
      "Alertas de decisão",
      "Plano mais escolhido por produtores",
    ],
    precos: { mensal: 106.09, trimestral: 265.23, anual: 1060.9 },
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    frase:
      "Para operações maiores que exigem controle, padrão e escala.",
    descricao: [
      "Tudo do plano Ultra",
      "Multi-fazendas e multi-usuários",
      "Gestão de equipes",
      "Relatórios personalizados",
      "Alertas automáticos avançados",
    ],
    precos: { mensal: 159.19, trimestral: 397.98, anual: 1591.9 },
  },
  {
    id: "premium_dominus",
    nome: "Premium Dominus 360°",
    frase:
      "Para quem pensa como dono ou investidor e precisa enxergar a fazenda como empresa.",
    descricao: [
      "Tudo do plano Empresarial",
      "CFO Autônomo integrado",
      "IA preditiva e diagnóstica",
      "EBITDA e EBIT automáticos",
      "Valuation e simulações financeiras",
      "Suporte Ultra VIP",
    ],
    precos: { mensal: 318.49, trimestral: 796.23, anual: 3184.9 },
  },
];

export default function PlanosClient() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const bloqueado = searchParams.get("bloqueado") === "1";

  const preco = (v: number) =>
    `R$ ${v.toFixed(2).replace(".", ",")}`;

  async function iniciarCheckout(plano: string) {
    try {
      setLoading(true);

      // 🔐 Verifica sessão Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Faça login para continuar");
        window.location.href = "/login";
        return;
      }

      // ✅ Endpoint CANÔNICO
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plano,
          periodo,
        }),
      });

      const data = await res.json();

      if (!data?.init_point) {
        console.error("Erro checkout:", data);
        alert("Erro ao iniciar pagamento");
        return;
      }

      // 🔁 Redirecionamento Mercado Pago
      window.location.href = data.init_point;
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Erro inesperado no checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {bloqueado && (
        <div className="mx-auto max-w-3xl rounded-xl border border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-800 text-center">
          Seu acesso ao sistema está bloqueado.
          <br />
          Escolha um plano para continuar usando o PecuariaTech.
        </div>
      )}

      {/* PERÍODO */}
      <div className="flex justify-center gap-2 mt-6">
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-10">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            className={`bg-white rounded-xl shadow p-6 space-y-4 ${
              plano.destaque ? "border-2 border-green-600" : ""
            }`}
          >
            <h2 className="text-xl font-semibold">{plano.nome}</h2>

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

            <button
              disabled={loading}
              onClick={() => iniciarCheckout(plano.id)}
              className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Processando..." : "Assinar"}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}