"use client";

import { useEffect, useState } from "react";

export default function PlanosPage() {
  const [planos, setPlanos] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/planos");
      const data = await res.json();
      setPlanos(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">📌 Planos de Assinatura</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((p: any) => (
          <div className="border rounded-xl p-6 bg-white shadow hover:shadow-lg transition">
            <h2 className="font-bold text-xl text-green-700">{p.nome}</h2>

            <p className="text-gray-700 mt-2">
              💰 <strong>R$ {p.preco}</strong>
            </p>

            <p className="text-sm mt-1">📌 Tipo: {p.nivel}</p>
            <p className="text-sm">⏳ Período: {p.periodo}</p>

            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Assinar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
