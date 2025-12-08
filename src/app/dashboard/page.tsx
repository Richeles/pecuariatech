"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [animais, setAnimais] = useState(0);
  const [pastos, setPastos] = useState(0);
  const [gastos, setGastos] = useState(0);

  async function carregarDados() {
    // total de animais
    const { count: totalAnimais } = await supabase
      .from("animais")
      .select("*", { count: "exact", head: true });
    setAnimais(totalAnimais || 0);

    // total de pastos (vamos criar tabela depois)
    const { count: totalPastos } = await supabase
      .from("pastos")
      .select("*", { count: "exact", head: true })
      .maybeSingle();
    setPastos(totalPastos || 0);

    // soma financeira (vamos criar depois)
    const { data: financeiro } = await supabase
      .from("financeiro")
      .select("valor");

    const soma = (financeiro || []).reduce((acc, i) => acc + Number(i.valor || 0), 0);
    setGastos(soma);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <main className="p-10 text-white">
      <h1 className="text-4xl font-bold mb-6">📊 PecuariaTech Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-600 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold">🐂 Animais</h2>
          <p className="text-4xl mt-3">{animais}</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold">🌱 Pastos</h2>
          <p className="text-4xl mt-3">{pastos}</p>
        </div>

        <div className="bg-yellow-600 p-6 rounded-2xl shadow-lg text-black">
          <h2 className="text-xl font-bold">💰 Gastos Totais</h2>
          <p className="text-4xl mt-3">R$ {gastos}</p>
        </div>
      </div>
    </main>
  );
}
