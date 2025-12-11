"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Paywall from "../components/Paywall";

export default function UltraBiologicaPage() {
  const [nivel, setNivel] = useState(null);

  useEffect(() => {
    async function verificarPlano() {
      const token = localStorage.getItem("sb-access-token");
      const resp = await fetch("/api/assinatura", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      setNivel(json.nivel);
    }
    verificarPlano();
  }, []);

  if (!nivel) return <div>Carregando...</div>;
  if (!["ultra", "empresarial", "premium"].includes(nivel)) return <Paywall />;

  return (
    <main className="p-6">

      <h1 className="text-3xl font-bold text-green-700 mb-4">
        UltraBiológica 360°
      </h1>
      <p className="text-gray-700 mb-8">
        Diagnóstico avançado de saúde, eficiência e performance do rebanho.
      </p>

      {/* Cards corporativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-green-50 p-6 rounded-3xl shadow">
          <h2 className="font-bold text-green-800 text-xl">Índice de Performance</h2>
          <p className="text-4xl font-extrabold text-green-900">92</p>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl shadow">
          <h2 className="font-bold text-green-800 text-xl">Eficiência Nutricional</h2>
          <p className="text-3xl font-bold">Alta</p>
        </div>

        <div className="bg-green-50 p-6 rounded-3xl shadow">
          <h2 className="font-bold text-green-800 text-xl">Mapa Biológico</h2>
          <p className="mt-2">Análise combinada de peso, ganho, clima e manejo.</p>
        </div>

      </div>

    </main>
  );
}
