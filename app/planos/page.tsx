"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";

type Periodo = "mensal" | "trimestral" | "anual";

type Plano = {
  codigo: string;
  nome_exibicao: string;
  nivel_ordem: number;
  mensal: number;
  trimestral: number;
  anual: number;
};

/**
 * MAPA OFICIAL — precisa bater com o banco
 */
const MAPA_PLANO_ID: Record<string, number> = {
  basico: 1,
  profissional: 2,
  ultra: 3,
  empresarial: 4,
  premium_dominus: 5,
};

const PAYWALL_PLANOS = ["ultra", "empresarial", "premium_dominus"];

export default function PlanosPage() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // CARREGAR PLANOS (FONTE ÚNICA — EQUAÇÃO Y)
  // ============================================================
  useEffect(() => {
    async function loadPlanos() {
      const { data, error } = await supabase
        .from("planos_precos_view")
        .select("*")
        .order("nivel_ordem", { ascending: true });

      if (error) {
        console.error("Erro ao carregar planos:", error);
        return;
      }

      setPlanos(data ?? []);
      setLoading(false);
    }

    loadPlanos();
  }, []);

  // ============================================================
  // CHECKOUT
  // ============================================================
  async function criarCheckout(plano_codigo: string, valor: number) {
    const plano_id = MAPA_PLANO_ID[plano_codigo];

    if (!plano_id) {
      alert("Plano inválido.");
      return;
    }

    const response = await fetch("/api/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plano: plano_codigo,
        plano_id,
        valor,
      }),
    });

    const data = await response.json();

    if (data?.init_point) {
      window.location.href = data.init_point;
    } else {
      alert("Erro ao criar pagamento.");
    }
  }

  if (loading) {
    return (
      <main className="p-8 text-white">
        Carregando planos...
      </main>
    );
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <main className="p-8 bg-green-900 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-6">
        Planos PecuariaTech
      </h1>

      {/* SELETOR */}
      <div className="flex gap-4 mb-8">
        {(["mensal", "trimestral", "anual"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-lg font-medium ${
              periodo === p
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {planos.map((plano) => {
          const isUltra = plano.codigo === "ultra";
          const isPaywall = PAYWALL_PLANOS.includes(plano.codigo);

          return (
            <div
              key={plano.codigo}
              className={`p-6 rounded-2xl bg-white shadow-xl border-4 ${
                isUltra ? "border-yellow-500" : "border-green-600"
              }`}
            >
              {isUltra && (
                <div className="text-center text-yellow-600 font-bold mb-1">
                  ⭐ RECOMENDADO
                </div>
              )}

              <h2 className="text-xl font-bold mb-2">
                {plano.nome_exibicao}
              </h2>

              <p className="text-3xl font-bold text-green-700 mb-4">
                R$ {plano[periodo].toFixed(2)}
              </p>

              <button
                onClick={() =>
                  criarCheckout(plano.codigo, plano[periodo])
                }
                className="w-full px-4 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all"
              >
                Assinar {plano.nome_exibicao}
              </button>

              {isPaywall && (
                <p className="mt-2 text-xs font-semibold text-red-600 text-center">
                  Requer verificação de assinatura
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
