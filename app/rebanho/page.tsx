"use client";

import { useEffect, useState } from "react";

export default function RebanhoPage() {
  const [animais, setAnimais] = useState([]);

  useEffect(() => {
    async function carregar() {
      const res = await fetch("/api/animais");
      const data = await res.json();
      setAnimais(data);
    }
    carregar();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🐄 Rebanho</h1>

      {animais.length === 0 ? (
        <p>Carregando dados...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animais.map((animal) => (
            <div key={animal.id} className="p-4 bg-white shadow rounded">
              <h2 className="font-bold">{animal.brinca} / {animal.raca}</h2>
              <p>Sexo: {animal.sexo}</p>
              <p>Peso: {animal.peso} kg</p>
              <p>Piquete: {animal.piquete}</p>
              <p>Nascimento: {animal.nasc}</p>
              <p>Status: {animal.status_biologico}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
