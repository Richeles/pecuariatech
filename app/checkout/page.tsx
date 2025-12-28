// CAMINHO: app/checkout/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

// ===============================
// TIPOS
// ===============================
type Periodo = "mensal" | "trimestral" | "anual";

// ===============================
// MAPA DE NOMES (UX)
// ===============================
const NOMES_PLANOS: Record<string, string> = {
  basico: "Básico",
  profissional: "Profissional",
  ultra: "Ultra",
  empresarial: "Empresarial",
  premium_dominus: "Premium Dominus 360°",
};

export default function CheckoutPage() {
  const params = useSearchParams();

  const plano = params.get("plano");
  const periodoParam = params.get("periodo");
  const preco = Number(params.get("preco"));

  const periodo = (
    periodoParam === "mensal" ||
    periodoParam === "trimestral" ||
    periodoParam === "anual"
  )
    ? (periodoParam as Periodo)
    : null;

  // ===============================
  // VALIDAÇÃO FORTE (ANTI-ERRO / ANTI-FRAUDE)
  // ===============================
  if (
    !plano ||
    !periodo ||
    Number.isNaN(preco) ||
    preco <= 0
  ) {
    return (
      <div className="p-10 text-red-600 font-semibold">
        Checkout inválido. Selecione um plano antes de continuar.
      </div>
    );
  }

  // ===============================
  // PAGAMENTO
  // ===============================
  async function pagar() {
    try {
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano, periodo, preco }),
      });

      const data = await res.json();

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao iniciar pagamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação com o servidor.");
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Confirmar Assinatura</h1>

      <div className="border rounded-xl p-6 bg-white shadow space-y-3">
        <p>
          <b>Plano:</b> {NOMES_PLANOS[plano] ?? plano}
        </p>
        <p>
          <b>Período:</b> {periodo}
        </p>
        <p className="text-2xl font-bold text-green-700">
          R$ {preco.toFixed(2)}
        </p>
      </div>

      <button
        onClick={pagar}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:opacity-90"
      >
        Pagar com Mercado Pago
      </button>
    </main>
  );
}
