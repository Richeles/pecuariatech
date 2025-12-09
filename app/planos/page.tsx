"use client";

import { useState } from "react";

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<"mensal" | "trimestral" | "anual">("mensal");

  const planos = [
    {
      nome: "Básico",
      preco: {
        mensal: 27.9,
        trimestral: 74.9,
        anual: 259.9,
      },
      beneficios: [
        "Dashboard simples",
        "Controle de rebanho",
        "Controle de pastagem",
        "Checklist básico (PDF)",
      ],
      botao: "Assinar Básico",
      cor: "border-green-600",
    },
    {
      nome: "Profissional",
      preco: {
        mensal: 34.9,
        trimestral: 94.9,
        anual: 339.9,
      },
      beneficios: [
        "Relatórios avançados",
        "Exportação Excel",
        "Indicadores financeiros",
        "Planilhas profissionais",
      ],
      botao: "Assinar Profissional",
      cor: "border-blue-600",
    },
    {
      nome: "Empresarial",
      preco: {
        mensal: 59.9,
        trimestral: 159.9,
        anual: 569.9,
      },
      beneficios: [
        "Multi-fazendas",
        "Funcionários",
        "Relatórios personalizados",
        "IA Intermediária",
        "Bônus Premium",
      ],
      botao: "Assinar Empresarial",
      cor: "border-orange-600",
    },
    {
      nome: "Ultra",
      preco: {
        mensal: 89.9,
        trimestral: 239.9,
        anual: 899.9,
      },
      beneficios: [
        "Tudo do Empresarial",
        "IA Completa Ultra",
        "Relatórios WhatsApp",
        "UltraBiológica v1.0",
        "Planilhas Ultra (todas)",
        "Checklist Premium",
        "Relatório mensal automático",
      ],
      botao: "Assinar Ultra",
      cor: "border-yellow-500",
      destaque: true,
    },
  ];

  async function criarCheckout(plano: string, valor: number) {
    const response = await fetch("/api/mercadopago", {
      method: "POST",
      body: JSON.stringify({
        plano,
        valor,
      }),
    });

    const data = await response.json();

    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      alert("Erro ao criar pagamento.");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-white mb-6">Planos PecuariaTech</h1>

      {/* Seleção de período */}
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

      {/* Cards dos planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={`p-6 rounded-2xl bg-white bg-opacity-90 shadow-xl border-4 ${plano.cor}`}
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

            <button
              onClick={() => criarCheckout(plano.nome, plano.preco[periodo])}
              className="w-full px-4 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg"
            >
              {plano.botao}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
