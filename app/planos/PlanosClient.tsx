"use client";

// CAMINHO: app/planos/PlanosClient.tsx
// Planos PecuariaTech — Client Component
// Equação Y aplicada | Next.js 16

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Periodo = "mensal" | "trimestral" | "anual";

const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    frase: "Para quem quer sair do caderno e organizar a fazenda.",
    descricao: [
      "Dashboard simples",
      "Controle básico de rebanho",
      "Relatório mensal automático",
    ],
    precos: { mensal: 31.75, trimestral: 79.38, anual: 317.5 },
  },
  {
    id: "profissional",
    nome: "Profissional",
    frase: "Para quem precisa entender melhor os números.",
    descricao: [
      "Tudo do Básico",
      "Indicadores financeiros",
      "Exportação de dados",
    ],
    precos: { mensal: 52.99, trimestral: 132.48, anual: 529.9 },
  },
];

export default function PlanosClient() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const searchParams = useSearchParams();

  const bloqueado = searchParams.get("bloqueado") === "1";

  const formatarPreco = (v: number) =>
    `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Planos PecuariaTech</h1>
          <p className="text-gray-600">
            Escolha o plano ideal para sua realidade no campo.
          </p>
        </header>

        {bloqueado && (
          <div className="rounded-lg bg-yellow-100 p-4 text-center text-yellow-800">
            Seu acesso está bloqueado. Escolha um plano para continuar.
          </div>
        )}

        {/* Toggle de período */}
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

        {/* Lista de planos */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANOS.map((plano) => (
            <div
              key={plano.id}
              className="bg-white rounded-xl shadow p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold">{plano.nome}</h2>

              <p className="italic text-gray-700">{plano.frase}</p>

              <p className="text-2xl font-bold text-green-600">
                {formatarPreco(plano.precos[periodo])}
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
