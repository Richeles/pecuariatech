"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout(plano_id: string) {
    try {
      setLoading(true);

      const res = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano_id }),
      });

      const data = await res.json();
      setLoading(false);

      if (data?.url) {
        window.location.href = data.url; // Redireciona para pagamento MP
      } else {
        alert("Falha ao gerar checkout.");
      }
    } catch (e) {
      setLoading(false);
      alert("Erro de comunicação com servidor.");
    }
  }

  return (
    <main style={{ padding: 32 }}>

      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 10 }}>
        ✨ Escolha seu plano e assine
      </h1>

      <p style={{ marginBottom: 30 }}>
        Você será direcionado ao checkout seguro para pagamento via PIX ou Cartão 💳
      </p>

      {/* Botões temporários — mais tarde vamos buscar da API */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => handleCheckout("ID_DO_PLANO_BASICO")}
          disabled={loading}
          style={{
            background: "green",
            padding: "12px 22px",
            color: "white",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {loading ? "Aguarde..." : "Assinar Plano Básico"}
        </button>

        <button
          onClick={() => handleCheckout("ID_DO_PLANO_PRO")}
          disabled={loading}
          style={{
            background: "blue",
            padding: "12px 22px",
            color: "white",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {loading ? "Aguarde..." : "Assinar Profissional"}
        </button>
      </div>
    </main>
  );
}
