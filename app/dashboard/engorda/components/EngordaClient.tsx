"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

type ApiStatusResp = {
  ok: boolean;
  source: "engorda_base_view" | string;
  count: number;
  data: any[];
};

type ApiProjResp = {
  ok: boolean;
  source: "engorda_projecao_view" | string;
  total: number;
  top_count: number;
  margem_media_top: number;
  risco_medio_top: number;
  por_cenario: Record<string, number>;
};

type UltraResp = {
  ok: boolean;
  domain: "engorda";
  ts: string;
  degraded: boolean;
  source: string[];
  kpis: {
    total: number;
    margem_media_top: number;
    risco_medio_top: number;
    pi_medio_top: number;
    risk_label: "OK" | "ATENCAO" | "CRITICO" | string;
  };
  motor_pi: { formula: string; note?: string };
  cenarios: { OTIMO: any[]; SEGURO: any[]; RAPIDO: any[] };
  esg: {
    enabled: boolean;
    selo_verde_status: "VERDE" | "AMARELO" | "VERMELHO" | string;
    risco_ambiental_score: number;
    message?: string;
  };
  sinais: any[];
  plano_acao: any[];
};

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export default function EngordaClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<ApiStatusResp | null>(null);
  const [proj, setProj] = useState<ApiProjResp | null>(null);
  const [ultra, setUltra] = useState<UltraResp | null>(null);

  async function loadAll() {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sem sessão");

      const [s, p, u] = await Promise.all([
        fetchJson<ApiStatusResp>("/api/engorda/status", token),
        fetchJson<ApiProjResp>("/api/engorda/projecao", token),
        fetchJson<UltraResp>("/api/engorda/ultra", token),
      ]);

      setStatus(s);
      setProj(p);
      setUltra(u);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) return <div>Carregando Engorda...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Engorda ULTRA</h2>

      <div>Total registros: {proj?.total ?? 0}</div>

      <div>
        Risco: {ultra?.kpis?.risk_label}
      </div>

      <div>
        Margem média: {ultra?.kpis?.margem_media_top}
      </div>
    </div>
  );
}