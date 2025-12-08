"use client";

import { useEffect, useState } from "react";

export default function RebanhoPage() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      const res = await fetch("/api/animais");
      const data = await res.json();
      setAnimais(data);
    } catch (err) {
      console.error("Erro ao carregar animais:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="p-6 text-white">

      <h1 className="text-3xl font-bold mb-4">🐄 Rebanho</h1>

      {carregando ? (
        <p>⏳ Carregando dados...</p>
      ) : animais.length === 0 ? (
        <p>📌 Nenhum animal cadastrado.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {animais.map((a) => (
            <div
              key={a.id}
              className="bg-white/20 p-4 rounded shadow text-black"
            >
              <p><b>Brinco:</b> {a.brinco}</p>
              <p><b>Raça:</b> {a.raça}</p>
              <p><b>Peso Atual:</b> {a.peso} kg</p>
              <p><b>Piquete:</b> {a.piquete}</p>
              <p><b>Status:</b> {a.status_biologico}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
