"use client";

import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPlanos() {
      const res = await fetch("/api/planos");
      const data = await res.json();
      setPlanos(data);
    }
    fetchPlanos();
  }, []);

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
      window.location.href = data.url;
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

      {planos.length === 0 && <p>Carregando planos...</p>}

      {planos.map((plano) => (
        <button
          key={plano.id}
          onClick={() => handleCheckout(plano.id)}
          disabled={loading}
          style={{
            background: "green",
            padding: "12px 20px",
            color: "white",
            borderRadius: 6,
            marginTop: 20,
            fontSize: 16,
            display: "block",
          }}
        >
          Assinar {plano.nome} — R$ {plano.preco}
        </button>
      ))}
    </main>
  );
}
