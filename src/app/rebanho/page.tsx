"use client";

import { useEffect, useState } from "react";

interface Animal {
  id: string;
  brinco: string;
  raca: string;
  sexo: string;
  peso: number;
  nasc: string;
  piquete: string;
}

export default function RebanhoPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarAnimais() {
    try {
      const res = await fetch("/api/animais");
      const data = await res.json();
      setAnimais(data);
    } catch (e) {
      console.error("Erro ao carregar animais:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAnimais();
  }, []);

  return (
    <main style={{ padding: 32, color: "white" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>📌 Lista do Rebanho</h1>

      {loading && <p>Carregando...</p>}

      {!loading && animais.length === 0 && (
        <p>Nenhum animal cadastrado ainda.</p>
      )}

      {animais.map((a) => (
        <div
          key={a.id}
          style={{
            background: "rgba(0,0,0,0.5)",
            padding: 12,
            marginTop: 10,
            borderRadius: 8,
          }}
        >
          <p><b>Brinco:</b> {a.brinco}</p>
          <p><b>Raça:</b> {a.raca}</p>
          <p><b>Sexo:</b> {a.sexo}</p>
          <p><b>Peso Atual:</b> {a.peso} kg</p>
          <p><b>Nascimento:</b> {a.nasc}</p>
          <p><b>Piquete:</b> {a.piquete}</p>
        </div>
      ))}
    </main>
  );
}
