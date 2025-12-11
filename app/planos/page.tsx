"use client";

import { useState } from "react";

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<"mensal" | "trimestral" | "anual">(
    "mensal"
  );

  // ============================================================
  // LISTA DE PLANOS + PAYWALL PARA PREMIUM/EMPRESARIAL/ULTRA
  // plano_id segue a lógica:
  // 1 = Básico
  // 2 = Profissional
  // 3 = Premium
  // 4 = Empresarial
  // 5 = Ultra
  // ============================================================

  const planos = [
    // BÁSICO -------------------------------------------------------------------
    {
      plano_id: 1,
      nome: "Básico",
      preco: { mensal: 27.9, trimestral: 74.9, anual: 259.9 },
      beneficios: [
        "Dashboard simples",
        "Controle de rebanho",
        "Controle de pastagem",
        "Relatório mensal simples",
      ],
      botao: "Assinar Básico",
      cor: "border-green-600",
      paywall: false,
    },

    // PROFISSIONAL -------------------------------------------------------------
    {
      plano_id: 2,
      nome: "Profissional",
      preco: { mensal: 34.9, trimestral: 94.9, anual: 339.9 },
      beneficios: [
        "Tudo do Básico",
        "Relatórios avançados mensais",
        "Exportação Excel",
        "Indicadores financeiros iniciais",
        "Planilhas profissionais",
        "Suporte via Telegram",
        "Relatórios automáticos Telegram",
      ],
      botao: "Assinar Profissional",
      cor: "border-blue-600",
      paywall: false,
    },

    // PREMIUM (NOVO) -----------------------------------------------------------
    {
      plano_id: 3,
      nome: "Premium",
      preco: { mensal: 49.9, trimestral: 139.9, anual: 499.9 },
      beneficios: [
        "Tudo do Profissional",
        "Financeiro Premium (EBITDA & EBIT automático)",
        "Valuation Incremental (4.5x EBITDA)",
        "Relatório Premium mensal",
        "Checklist Premium",
        "Planilha Financeira Premium",
        "Sugestões Inteligentes (IA nível 1)",
        "Suporte WhatsApp padrão",
      ],
      botao: "Assinar Premium",
      cor: "border-purple-600",
      paywall: true,
    },

    // EMPRESARIAL --------------------------------------------------------------
    {
      plano_id: 4,
      nome: "Empresarial",
      preco: { mensal: 69.9, trimestral: 189.9, anual: 659.9 },
      beneficios: [
        "Tudo do Premium",
        "Multi-fazendas + usuários",
        "Gestão de funcionários",
        "Relatórios personalizados avançados",
        "IA Intermediária (peso + clima + pasto)",
        "Alertas automáticos no Telegram",
        "Planilhas Premium avançadas",
        "Suporte prioritário",
      ],
      botao: "Assinar Empresarial",
      cor: "border-orange-600",
      paywall: true,
    },

    // ULTRA --------------------------------------------------------------------
    {
      plano_id: 5,
      nome: "Ultra",
      preco: { mensal: 89.9, trimestral: 239.9, anual: 899.9 },
      beneficios: [
        "Tudo do Empresarial",
        "IA Completa Ultra (preditiva + diagnóstica)",
        "UltraBiológica 360° completa",
        "Modelo Financeiro Avançado (CAPEX/OPEX)",
        "Cálculo automático EBITDA e EBIT Ultra",
        "Valuation Mercado / Fundos / Holding",
        "Planilha Premium Ultra 2025–2030",
        "Checklist Ultra",
        "Grupos VIP (Telegram e WhatsApp)",
        "Suporte prioritário Ultra",
      ],
      botao: "Assinar Ultra",
      cor: "border-yellow-500",
      destaque: true,
      paywall: true,
    },
  ];

  // ============================================================
  // CHECKOUT MERCADO PAGO — ENVIA TAMBÉM O plano_id
  // ============================================================

  async function criarCheckout(plano_nome: string, valor: number, plano_id: number) {
    const response = await fetch("/api/mercadopago", {
      method: "POST",
      body: JSON.stringify({ plano: plano_nome, valor, plano_id }),
    });

    const data = await response.json();

    if (data.init_point) window.location.href = data.init_point;
    else alert("Erro ao criar pagamento.");
  }

  // ============================================================
  // INTERFACE
  // ============================================================

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-white mb-6">Planos PecuariaTech</h1>

      {/* SELETOR DE PERÍODO */}
      <div className="flex gap-4 mb-8">
        {["mensal", "trimestral", "anual"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p as any)}
            className={`px-4 py-2 rounded-lg font-medium ${
              periodo === p ? "bg-green-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={`p-6 rounded-2xl bg-white shadow-xl border-4 bg-opacity-90 ${plano.cor}`}
          >
            {plano.destaque && (
              <div className="text-center text-yellow-600 font-bold">⭐ RECOMENDADO</div>
            )}

            <h2 className="text-xl font-bold text-black mb-2">{plano.nome}</h2>

            <p className="text-3xl font-bold text-green-700 mb-4">
              R$ {plano.preco[periodo].toFixed(2)}
            </p>

            <ul className="text-black mb-4 space-y-1">
              {plano.beneficios.map((b, i) => (
                <li key={i}>✔ {b}</li>
              ))}
            </ul>

            {/* BOTÃO ASSINAR */}
            <button
              onClick={() =>
                criarCheckout(plano.nome, plano.preco[periodo], plano.plano_id)
              }
              className="w-full px-4 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              {plano.botao}
            </button>

            {/* PAYWALL LABEL */}
            {plano.paywall && (
              <p className="mt-2 text-xs font-semibold text-red-600 text-center">
                Requer verificação de assinatura
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
