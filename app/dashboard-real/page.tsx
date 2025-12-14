"use client";

import { useEffect, useState } from "react";
import DashboardRealLayout from "./components/DashboardRealLayout";
import { KpiReal } from "./components/KpiReal";

type ResumoRebanho = {
  total_animais: number;
  lotes_ativos: number;
  peso_medio: number;
};

export default function DashboardRealPage() {
  const [resumo, setResumo] = useState<ResumoRebanho | null>(null);

  useEffect(() => {
    async function carregar() {
      const res = await fetch("/api/rebanho/resumo", { cache: "no-store" });
      const data: ResumoRebanho = await res.json();
      setResumo(data);
    }
    carregar();
  }, []);

  if (!resumo) {
    return <p>Carregando dados do rebanho...</p>;
  }

  return (
    <DashboardRealLayout>
      <h1>Dashboard Real do Produtor</h1>

      <div style={{ display: "flex", gap: 20, marginTop: 24 }}>
        <KpiReal title="Animais no Rebanho" value={resumo.total_animais} />
        <KpiReal title="Lotes Ativos" value={resumo.lotes_ativos} />
        <KpiReal
          title="Peso Médio (kg)"
          value={resumo.peso_medio.toFixed(1)}
        />
      </div>
    </DashboardRealLayout>
  );
}
