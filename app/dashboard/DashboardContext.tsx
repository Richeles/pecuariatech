// app/dashboard/DashboardContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDashboardBootstrap } from "./hooks/useDashboardBootstrap";

export type DashboardDTO = {
  schema_version: string;
  api_version: string;
  cache_hit: boolean;
  user_id: string;
  timestamp: string;
  score_pi: number;
  roi: number;
  margem: number;
  ebitda: number;
  gmd: number;
  lotacao: number;
  capital_score: number;
  governanca: number;
  esg: number;
  compliance: number;
  rastreabilidade: number;
  maturidade_digital: number;
  capital_intelectual: number;
  risco_estrutural: string;
};

type DashboardContextValue = {
  data: DashboardDTO | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const { data, loading, error } = useDashboardBootstrap(userId);

  // 🔒 NUNCA repassa o erro para a UI – apenas loading e data
  const contextValue: DashboardContextValue = {
    data,
    loading,
    error: null, // suprime erros – a UI vê apenas loading
    refetch: () => {}, // implementar depois se necessário
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}
export default DashboardProvider;