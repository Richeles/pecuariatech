"use client";

import { useEffect, useState } from "react";

type Plano = {
  id: string;
  nome: string;
  preco: number;
  nivel: string;
  periodicidade: string;
};

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/planos")
      .then((res) => res.json())
      .then((data) => {
        // filtra duplicados por nome
        const únicos = Array.from(new Map(data.map(p => [p.nome, p])).values());
        setPlanos(únicos);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: 20 }}>
        Planos PecuariaTech 🐂💰
      </h1>

      {loading && <p>Carregando planos...</p>}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {planos.map((plano) => (
          <div
            key={plano.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 16,
              width: 250,
              background: "#fff",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: "bold" }}>{plano.nome}</h2>
            <p style={{ fontSize: 16 }}>
              💵 <b>R$ {plano.preco.toFixed(2)}</b>
            </p>
            <p>📌 Nível: <b>{plano.nivel}</b></p>
            <p>⏳ Ciclo: <b>{plano.periodicidade}</b></p>
            <button
              style={{
                marginTop: 15,
                width: "100%",
                padding: 10,
                background: "#2b8a3e",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Assinar Plano
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
