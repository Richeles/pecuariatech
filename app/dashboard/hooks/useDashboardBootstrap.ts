// app/dashboard/hooks/useDashboardBootstrap.ts
"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardDTO } from "../DashboardContext";

const RETRY_MAX = 3;
const RETRY_DELAY_BASE = 1000; // 1s, multiplicado pelo attempt

export function useDashboardBootstrap(userId: string) {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const attemptRef = useRef(0);

  const fetchWithRetry = async (attempt: number): Promise<DashboardDTO> => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`/api/dashboard?user_id=${userId}`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (!json || typeof json !== "object") {
        throw new Error("Resposta inválida");
      }
      return json;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }
      if (attempt < RETRY_MAX) {
        const delay = RETRY_DELAY_BASE * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(attempt + 1);
      }
      throw err;
    }
  };

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    attemptRef.current = 0;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchWithRetry(1);
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dados");
          setLoading(false);
          // Mantém estado de loading para não exibir erro, mas com mensagem amigável
          setLoading(true);
          setError("Sistema iniciando...");
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userId]);

  return { data, loading, error };
}