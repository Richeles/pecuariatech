"use client";

import { createContext, useContext, useState, ReactNode } from "react";
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
  dashboardRefreshKey: number;
  triggerDashboardRefresh: () => void;
};

const DashboardContext =
  createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);

  if (!ctx) {
    throw new Error(
      "useDashboard must be used within DashboardProvider"
    );
  }

  return ctx;
}

export function DashboardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data, loading, error } = useDashboardBootstrap();

  const [dashboardRefreshKey, setDashboardRefreshKey] =
    useState(0);

  const triggerDashboardRefresh = () =>
    setDashboardRefreshKey((prev) => prev + 1);

  const contextValue: DashboardContextValue = {
    data,
    loading,
    error: error ? new Error(error) : null,
    refetch: () => {},
    dashboardRefreshKey,
    triggerDashboardRefresh,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export default DashboardProvider;
