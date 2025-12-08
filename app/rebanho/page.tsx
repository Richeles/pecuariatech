"use client";

import { useEffect, useState } from "react";

export default function RebanhoPage() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/animais");
        const dados = await res.json();
        setAnimais(dados);
      } catch (err) {
        console.error("Erro ao buscar animais:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🐄 Rebanho</h1>

      {loading ? (
        <p>Carregando dados...</p>
      ) : animais.length === 0 ? (
        <p>Nenhum animal encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animais.map((a) => (
            <div key={a.id} className="p-4 bg-white shadow rounded">
              <h2 className="font-bold text-lg">Brinco: {a.brinca}</h2>
              <p>Raça: {a.raca}</p>
              <p>Sexo: {a.sexo}</p>
              <p>Peso: {a.peso} kg</p>
              <p>Piquete: {a.piquete}</p>
              <p>Nascimento: {a.nasc}</p>
              <p>Status: {a.status_biologico}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
