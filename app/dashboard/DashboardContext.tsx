// app/dashboard/DashboardContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";

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

const CACHE_TTL = 60000;

export function DashboardProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const CACHE_KEY = `dashboard_pi_${userId}`;

  const fetchData = async (force = false) => {
    if (!force) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed._timestamp < CACHE_TTL) {
            setData(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/dashboard?user_id=${userId}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: DashboardDTO = await res.json();
      if (!json.schema_version) throw new Error("DTO inválido");
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...json, _timestamp: Date.now() }));
      setData(json);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("[DashboardProvider] Erro:", err);
      setError(err instanceof Error ? err : new Error("Falha na requisição"));
      setData({
        schema_version: "0.0.0",
        api_version: "v1",
        cache_hit: false,
        user_id: userId,
        timestamp: new Date().toISOString(),
        score_pi: 0,
        roi: 0,
        margem: 0,
        ebitda: 0,
        gmd: 0,
        lotacao: 0,
        capital_score: 0,
        governanca: 0,
        esg: 0,
        compliance: 0,
        rastreabilidade: 0,
        maturidade_digital: 0,
        capital_intelectual: 0,
        risco_estrutural: "indisponivel",
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const refetch = () => fetchData(true);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), CACHE_TTL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [userId]);

  return (
    <DashboardContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </DashboardContext.Provider>
  );
}
export default DashboardProvider;
