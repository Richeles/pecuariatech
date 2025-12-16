"use client";

import { useEffect, useState } from "react";

export type StatusAssinatura =
  | "anonimo"
  | "trial"
  | "trial_expirado"
  | "ativa";

export interface AssinaturaStatus {
  status: StatusAssinatura;
  plano?: string;
  expiracao?: string;
}

interface UseAssinaturaResult {
  loading: boolean;
  assinatura: AssinaturaStatus | null;
  isAnonimo: boolean;
  isTrial: boolean;
  isAtiva: boolean;
  isExpirada: boolean;
  requiresUpgrade: boolean;
  refresh: () => Promise<void>;
}

export function useAssinatura(): UseAssinaturaResult {
  const [loading, setLoading] = useState(true);
  const [assinatura, setAssinatura] = useState<AssinaturaStatus | null>(null);

  async function carregar() {
    try {
      setLoading(true);

      const res = await fetch("/api/assinatura/status", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Falha ao consultar status da assinatura");
      }

      const data = (await res.json()) as AssinaturaStatus;
      setAssinatura(data);
    } catch (error) {
      console.error("Erro em useAssinatura:", error);
      setAssinatura({ status: "anonimo" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const status = assinatura?.status;

  return {
    loading,
    assinatura,

    isAnonimo: status === "anonimo",
    isTrial: status === "trial",
    isAtiva: status === "ativa",
    isExpirada: status === "trial_expirado",

    requiresUpgrade:
      status === "trial_expirado" || status === "anonimo",

    refresh: carregar,
  };
}
