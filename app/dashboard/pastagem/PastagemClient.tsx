"use client";

import { useEffect, useMemo, useState } from "react";

import PastagemErrorBoundary
from "./components/PastagemErrorBoundary";

import UltraBiologicoPastagem
from "./components/UltraBiologicoPastagem";

// ======================================================
// TYPES
// ======================================================

type RuntimeStatus =
  | "ONLINE"
  | "DEGRADED"
  | "OFFLINE";

type RuntimePayload = {
  ok?: boolean;
  runtime_online?: boolean;
  runtime_status?: RuntimeStatus;
  cofator_triangular?: string;
  executivo?: string;
  operacional?: string;
  tatico?: string;
};

type Alerta = {
  tipo:
    | "critico"
    | "atencao"
    | "info";

  titulo: string;
  detalhe: any;
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

// ======================================================
// SAFE ENGINE
// ======================================================

function safeText(v: any): string {

  if (
    v === null ||
    v === undefined
  ) {
    return "";
  }

  if (
    typeof v === "string"
  ) {
    return v;
  }

  if (
    typeof v === "number" ||
    typeof v === "boolean"
  ) {
    return String(v);
  }

  if (
    Array.isArray(v)
  ) {

    return v
      .map(safeText)
      .filter(Boolean)
      .join(" • ");
  }

  if (
    typeof v === "object"
  ) {

    try {

      const executivo =
        safeText(v.executivo);

      const operacional =
        safeText(v.operacional);

      const tatico =
        safeText(v.tatico);

      return [
        executivo,
        operacional,
        tatico,
      ]
        .filter(Boolean)
        .join(" • ");

    } catch {

      return "[objeto]";
    }
  }

  return String(v);
}

function safeNumber(
  v: any,
  fallback = 0
): number {

  const n = Number(v);

  return Number.isFinite(n)
    ? n
    : fallback;
}

// ======================================================
// NORMALIZERS
// ======================================================

function normalizeResumo(
  raw: any
): ResumoPastagem {

  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return {};
  }

  return {

    escopo:
      safeText(raw.escopo),

    qtd_piquetes:
      safeNumber(raw.qtd_piquetes),

    area_total_ha:
      safeNumber(raw.area_total_ha),

    area_ativa_ha:
      safeNumber(raw.area_ativa_ha),

    animais_total:
      safeNumber(raw.animais_total),

    ua_total:
      safeNumber(raw.ua_total),

    ua_por_ha_atual:
      safeNumber(raw.ua_por_ha_atual),

    ua_por_ha_suportada:
      safeNumber(raw.ua_por_ha_suportada),

    ua_suportada_ativa:
      safeNumber(raw.ua_suportada_ativa),

    pressao_pastagem_score:
      safeNumber(raw.pressao_pastagem_score),

    risco_pastagem:
      safeText(raw.risco_pastagem),

    decisao_recomendada:
      safeText(raw.decisao_recomendada),

    ultima_movimentacao_em:
      safeText(raw.ultima_movimentacao_em),
  };
}

function normalizePiquetes(
  raw: any
): Piquete[] {

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((p) => ({

    piquete_id:
      safeText(p?.piquete_id),

    nome:
      safeText(p?.nome),

    area_ha:
      safeNumber(p?.area_ha),

    tipo_pasto:
      safeText(p?.tipo_pasto),

    capacidade_ua:
      safeNumber(p?.capacidade_ua),

    status:
      safeText(p?.status),

    ultima_movimentacao_em:
      safeText(p?.ultima_movimentacao_em),

  }));
}

function normalizeAlertas(
  raw: any
): Alerta[] {

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((a) => ({

    tipo:
      a?.tipo === "critico" ||
      a?.tipo === "atencao"
        ? a.tipo
        : "info",

    titulo:
      safeText(a?.titulo),

    detalhe:
      safeText(
        a?.detalhe ??
        a?.descricao
      ),

  }));
}

// ======================================================
// COMPONENT
// ======================================================

export default function PastagemClient() {

  const [
    mounted,
    setMounted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] = useState<string | null>(null);

  const [
    resumoRaw,
    setResumoRaw,
  ] = useState<any>(null);

  const [
    piquetesRaw,
    setPiquetesRaw,
  ] = useState<any[]>([]);

  const [
    alertasRaw,
    setAlertasRaw,
  ] = useState<any[]>([]);

  const [
    runtime,
    setRuntime,
  ] = useState<RuntimePayload | null>(null);

  // ======================================================
  // HYDRATION FIX
  // ======================================================

  useEffect(() => {

    setMounted(true);

  }, []);

  // ======================================================
  // LOAD
  // ======================================================

  useEffect(() => {

    if (!mounted) {
      return;
    }

    let alive = true;

    async function load() {

      try {

        setLoading(true);
        setErro(null);

        const res =
          await fetch(

            `/api/pastagem/status?ts=${Date.now()}`,

            {
              cache:
                "no-store",
            }
          );

        if (!res.ok) {

          throw new Error(
            `Pastagem HTTP ${res.status}`
          );
        }

        const json =
          await res.json();

        let runtimeJson: RuntimePayload = {

          runtime_status:
            "DEGRADED",

          runtime_online:
            false,
        };

        try {

          const runtimeRes =
            await fetch(
              "/api/ai/pastagem",
              {
                cache:
                  "no-store",
              }
            );

          if (
            runtimeRes.ok
          ) {

            runtimeJson =
              await runtimeRes.json();
          }

        } catch {

          runtimeJson = {

            runtime_status:
              "DEGRADED",

            runtime_online:
              false,
          };
        }

        if (!alive) {
          return;
        }

        setResumoRaw(
          json?.resumo ?? null
        );

        setPiquetesRaw(
          Array.isArray(
            json?.piquetes
          )
            ? json.piquetes
            : []
        );

        setAlertasRaw(
          Array.isArray(
            json?.alertas
          )
            ? json.alertas
            : []
        );

        setRuntime(runtimeJson);

      } catch (e: any) {

        if (!alive) {
          return;
        }

        setErro(
          e?.message ??
          "Erro inesperado."
        );

      } finally {

        if (!alive) {
          return;
        }

        setLoading(false);
      }
    }

    load();

    return () => {

      alive = false;
    };

  }, [mounted]);

  // ======================================================
  // MEMO
  // ======================================================

  const resumo =
    useMemo(
      () =>
        normalizeResumo(
          resumoRaw
        ),
      [resumoRaw]
    );

  const piquetes =
    useMemo(
      () =>
        normalizePiquetes(
          piquetesRaw
        ),
      [piquetesRaw]
    );

  const alertas =
    useMemo(
      () =>
        normalizeAlertas(
          alertasRaw
        ),
      [alertasRaw]
    );

  // ======================================================
  // SSR SAFE
  // ======================================================

  if (!mounted) {

    return (

      <section className="p-6">

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">

          Inicializando governança cognitiva...

        </div>

      </section>
    );
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <section className="p-6">

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">

          Inicializando governança cognitiva...

        </div>

      </section>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (erro) {

    return (

      <section className="p-6">

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">

          <div className="text-sm font-semibold text-red-300">

            Runtime estrutural degradado

          </div>

          <div className="mt-2 text-xs text-red-200">

            {erro}

          </div>

        </div>

      </section>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (

    <PastagemErrorBoundary>

      <section className="space-y-6">

        {/* ======================================================
            STATUS EXECUTIVO
        ====================================================== */}

        {runtime?.runtime_online ? (

          <div
            className="
              rounded-2xl
              border
              border-[#4f9b68]
              bg-gradient-to-r
              from-[#dff7e8]
              via-[#ccefd9]
              to-[#dff7e8]
              p-5
              shadow-[0_8px_30px_rgba(16,185,129,0.10)]
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <div
                  className="
                    text-base
                    font-black
                    tracking-tight
                    text-[#0f5132]
                  "
                >
                  Runtime Cognitivo Online
                </div>

                <div
                  className="
                    mt-1
                    text-sm
                    font-medium
                    text-[#1f6b45]
                  "
                >
                  Symbiosis Python +
                  Cofatores Triangulares ativos.
                </div>

              </div>

              <div
                className="
                  rounded-full
                  border
                  border-[#4f9b68]
                  bg-[#2f855a]
                  px-4
                  py-1.5
                  text-xs
                  font-black
                  tracking-[0.18em]
                  text-white
                  shadow-md
                "
              >
                ONLINE
              </div>

            </div>

          </div>

        ) : (

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-sm font-semibold text-amber-300">

                  Runtime Cognitivo Degradado

                </div>

                <div className="mt-1 text-xs text-amber-200/80">

                  Governança preservada via fallback estrutural.

                </div>

              </div>

              <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">

                FALLBACK

              </div>

            </div>

          </div>

        )}

        {/* ======================================================
            ENGINE
        ====================================================== */}

        <UltraBiologicoPastagem
          resumo={resumo}
          piquetes={piquetes}
          alertas={alertas}
        />

      </section>

    </PastagemErrorBoundary>
  );
}