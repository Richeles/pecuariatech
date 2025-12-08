"use client";

import { useEffect, useState } from "react";

export default function PlanosPage() {
  const [planos, setPlanos] = useState([]);

  useEffect(() => {
    fetch("/api/planos")
      .then(res => res.json())
      .then(data => setPlanos(data))
      .catch(err => console.error("Erro API:", err));
  }, []);

  return (
    <div className="relative z-10 bg-white bg-opacity-90 p-6 rounded-md max-w-6xl mx-auto mt-10 shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-green-800">
        📌 Planos PecuariaTech
      </h1>

      {planos.length === 0 && (
        <p className="text-gray-600">Carregando planos...</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((p) => (
          <div key={p.id} className="p-4 border rounded shadow bg-white">
            <h2 className="text-xl font-bold">{p.nome}</h2>

            <p className="text-sm text-gray-600 capitalize">
              {p.nivel} • {p.periodicidade}
            </p>

            <p className="text-2xl font-bold mt-3 text-green-700">
              R$ {p.preco.toFixed(2)}
            </p>

            <button className="mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-900">
              Assinar agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
