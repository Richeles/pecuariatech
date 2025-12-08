"use client";

import { useEffect, useState } from "react";

export default function PlanosPage() {
  const [planos, setPlanos] = useState([]);

  async function carregar() {
    const res = await fetch("/api/planos");
    const data = await res.json();
    setPlanos(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto text-black">
      <h1 className="text-4xl font-bold mb-8 text-center">📦 Escolha Seu Plano</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map(plan => (
          <div key={plan.id} className="border shadow p-6 rounded-xl bg-white">
            <h2 className="text-xl font-bold">{plan.nome}</h2>
            <p className="text-2xl font-bold text-green-700 mt-2">
              R$ {plan.preco}
            </p>
            <button className="mt-4 w-full bg-green-700 text-white py-2 rounded hover:bg-green-900">
              Assinar agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
