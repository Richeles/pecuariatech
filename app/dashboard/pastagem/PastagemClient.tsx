"use client";

import { useEffect, useMemo, useState } from "react";
import PastagemErrorBoundary from "./components/PastagemErrorBoundary";
import UltraBiologicoPastagem from "./components/UltraBiologicoPastagem";

/**
 * ✅ BLINDAGEM INTERNACIONAL — PastagemClient
 * - Evita crash React #31 (objeto como child)
 * - Normaliza qualquer string/array/objeto em texto seguro
 * - Protege rota com ErrorBoundary (SaaS não cai)
 *
 * Regra:
 * - Nunca renderizar objeto puro.
 * - Sempre normalizar qualquer campo vindo de API/motor.
 */

// ---------- types ----------
type Alerta = {
  tipo: "critico" | "atencao" | "info";
  titulo: string;
  detalhe: any; // <- blindado propositalmente
};

type ResumoPastagem = {
  escopo?: any;
  qtd_piquetes?: any;
  area_total_ha?: any;
  area_ativa_ha?: any;
  animais_total?: any;
  ua_total?: any;
  ua_por_ha_atual?: any;
  ua_por_ha_suportada?: any;
  ua_suportada_ativa?: any;
  pressao_pastagem_score?: any;
  risco_pastagem?: any;
  decisao_recomendada?: any;
  ultima_movimentacao_em?: any;
};

type Piquete = {
  piquete_id?: any;
  nome?: any;
  area_ha?: any;
  tipo_pasto?: any;
  capacidade_ua?: any;
  status?: any;
  ultima_movimentacao_em?: any;
};

// ---------- safe utils ----------
function safeText(v: any): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);

  // array → texto
  if (Array.isArray(v)) return v.map(safeText).filter(Boolean).join(", ");

  // objeto: tenta padrão Triângulo 360 (executivo/operacional)
  if (typeof v === "object") {
    const exec = (v as any)?.executivo;
    const op = (v as any)?.operacional;

    if (exec || op) {
      const a = safeText(exec);
      const b = safeText(op);
      if (a && b) return `${a} • ${b}`;
      return a || b || "";
    }

    // fallback universal (não quebra)
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }

  return String(v);
}

function safeNumber(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeResumo(raw: any): ResumoPastagem | null {
  if (!raw || typeof raw !== "object") return null;

  // ✅ mantém Equação Y: apenas normaliza para render seguro
  return {
    escopo: safeText(raw.escopo ?? ""),
    qtd_piquetes: safeNumber(raw.qtd_piquetes ?? 0, 0),
    area_total_ha: safeNumber(raw.area_total_ha ?? 0, 0),
    area_ativa_ha: safeNumber(raw.area_ativa_ha ?? 0, 0),
    animais_total: safeNumber(raw.animais_total ?? 0, 0),
    ua_total: safeNumber(raw.ua_total ?? 0, 0),
    ua_por_ha_atual: safeNumber(raw.ua_por_ha_atual ?? 0, 0),
    ua_por_ha_suportada: safeNumber(raw.ua_por_ha_suportada ?? 0, 0),
    ua_suportada_ativa: safeNumber(raw.ua_suportada_ativa ?? 0, 0),
    pressao_pastagem_score: safeNumber(raw.pressao_pastagem_score ?? 0, 0),
    risco_pastagem: safeText(raw.risco_pastagem ?? "DESCONHECIDO"),
    decisao_recomendada: safeText(raw.decisao_recomendada ?? ""),
    ultima_movimentacao_em: safeText(raw.ultima_movimentacao_em ?? ""),
  };
}

function normalizePiquetes(raw: any): Piquete[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((p) => ({
    piquete_id: safeText(p?.piquete_id ?? ""),
    nome: safeText(p?.nome ?? ""),
    area_ha: safeNumber(p?.area_ha ?? 0, 0),
    tipo_pasto: safeText(p?.tipo_pasto ?? ""),
    capacidade_ua: safeNumber(p?.capacidade_ua ?? 0, 0),
    status: safeText(p?.status ?? ""),
    ultima_movimentacao_em: safeText(p?.ultima_movimentacao_em ?? ""),
  }));
}

function normalizeAlertas(raw: any): Alerta[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((a) => ({
      tipo:
        a?.tipo === "critico" || a?.tipo === "atencao" || a?.tipo === "info"
          ? a.tipo
          : "info",
      titulo: safeText(a?.titulo ?? "Alerta"),
      detalhe: safeText(a?.detalhe ?? a?.descricao ?? ""),
    }))
    .filter((x) => x.titulo || x.detalhe);
}

// ---------- client ----------
export default function PastagemClient() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [resumoRaw, setResumoRaw] = useState<any>(null);
  const [piquetesRaw, setPiquetesRaw] = useState<any[]>([]);
  const [alertasRaw, setAlertasRaw] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErro(null);

        // ✅ API read-only (Equação Y)
        const res = await fetch(`/api/pastagem/status?ts=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Falha na Pastagem (HTTP ${res.status})`);

        const json = await res.json();

        if (!alive) return;
        setResumoRaw(json?.resumo ?? null);
        setPiquetesRaw(Array.isArray(json?.piquetes) ? json.piquetes : []);
        setAlertasRaw(Array.isArray(json?.alertas) ? json.alertas : []);
      } catch (e: any) {
        if (!alive) return;
        setErro(String(e?.message ?? "Erro inesperado na Pastagem."));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const resumo = useMemo(() => normalizeResumo(resumoRaw), [resumoRaw]);
  const piquetes = useMemo(() => normalizePiquetes(piquetesRaw), [piquetesRaw]);
  const alertas = useMemo(() => normalizeAlertas(alertasRaw), [alertasRaw]);

  if (loading) {
    return (
      <section className="p-6">
        <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
          Carregando Pastagem...
        </div>
      </section>
    );
  }

  if (erro) {
    return (
      <section className="p-6">
        <div className="rounded-xl border bg-white p-4 text-sm">
          <b>Erro:</b> {erro}
        </div>
      </section>
    );
  }

  // ✅ Blindagem FINAL: Pastagem nunca derruba a rota
  return (
    <PastagemErrorBoundary>
      <UltraBiologicoPastagem resumo={resumo} piquetes={piquetes} alertas={alertas} />
    </PastagemErrorBoundary>
  );
}
