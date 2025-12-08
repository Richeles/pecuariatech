"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout(plano_id: string) {
    setLoading(true);

    const res = await fetch("/api/mercadopago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plano_id }),
    });

    const data = await res.json();
    setLoading(false);

    if (data?.url) {
      window.location.href = data.url; // Redireciona para pagamento
    } else {
      alert("Erro ao iniciar pagamento.");
    }
  }

  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        Escolha seu plano e assine 🚀
      </h1>

      <p>Você será redirecionado para o checkout seguro.</p>

      {/* Botões de teste — depois vamos gerar automaticamente */}
      <button
        onClick={() => handleCheckout("COLOQUE_AQUI_O_ID_DO_PLANO_BASICO")}
        disabled={loading}
        style={{
          background: "green",
          padding: "12px 20px",
          color: "white",
          borderRadius: 6,
          marginTop: 20,
          fontSize: 16,
        }}
      >
        Assinar Plano Básico
      </button>

      <button
        onClick={() => handleCheckout("COLOQUE_AQUI_O_ID_DO_PLANO_PRO")}
        disabled={loading}
        style={{
          background: "blue",
          padding: "12px 20px",
          color: "white",
          borderRadius: 6,
          marginTop: 20,
          fontSize: 16,
          marginLeft: 10,
        }}
      >
        Assinar Plano Profissional
      </button>
    </main>
  );
}
