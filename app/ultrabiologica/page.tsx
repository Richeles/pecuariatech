"use client";

import { useState, useEffect } from "react";
import Paywall from "../components/Paywall";

export default function UltrabiologicaPage() {
  const [nivel, setNivel] = useState<string | null>(null);

  // --------------------------------------------------------
  // Verificar assinatura do usuário
  // --------------------------------------------------------
  useEffect(() => {
    async function verificar() {
      const token = localStorage.getItem("sb-access-token");

      const resp = await fetch("/api/assinatura", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await resp.json();
      setNivel(json.nivel);
    }

    verificar();
  }, []);

  // --------------------------------------------------------
  // Tela de carregamento
  // --------------------------------------------------------
  if (nivel === null) {
    return <div>Carregando UltraBiológica...</div>;
  }

  // --------------------------------------------------------
  // BLOQUEIO DE ACESSO
  // --------------------------------------------------------
  if (nivel !== "premium") {
    return <Paywall />;
  }

  // --------------------------------------------------------
  // CONTEÚDO LIBERADO PARA PREMIUM
  // --------------------------------------------------------
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-4">
        UltraBiológica 360° — Módulo Premium
      </h1>

      <p className="text-lg">
        Bem-vindo ao módulo completo da UltraBiológica. Aqui serão exibidos
        diagnósticos avançados, valuation pecuário e análises automáticas.
      </p>

      {/* Em breve: gráficos, KPIs, análises */}
    </div>
  );
}
