"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { createClient }
from "@/app/lib/supabase-browser";

import EngordaExecutivePanel
from "./cognitivo/EngordaExecutivePanel";

const supabase =
  createClient();

/* =========================================================
   TYPES
========================================================= */

type ApiStatusResp = {

  ok: boolean;

  source: string;

  count: number;

  data: any[];
};

type ApiProjResp = {

  ok: boolean;

  total: number;

  margem_media_top: number;

  risco_medio_top: number;
};

type UltraResp = {

  ok: boolean;

  degraded: boolean;

  kpis: {

    total: number;

    margem_media_top: number;

    risco_medio_top: number;

    pi_medio_top: number;

    risk_label: string;
  };

  esg: {

    selo_verde_status: string;

    risco_ambiental_score: number;
  };

  plano_acao: any[];

  sinais: any[];
};

/* =========================================================
   TOKEN
========================================================= */

async function getAccessToken() {

  const { data } =
    await supabase.auth.getSession();

  return (
    data.session?.access_token ?? null
  );
}

/* =========================================================
   FETCH
========================================================= */

async function fetchJson<T>(
  url: string,
  token: string
): Promise<T> {

  const res =
    await fetch(url, {

      headers: {

        Authorization:
          `Bearer ${token}`,
      },

      cache: "no-store",
    });

  if (!res.ok) {

    throw new Error(
      `HTTP ${res.status}`
    );
  }

  return res.json();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function EngordaClient() {

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [status, setStatus] =
    useState<ApiStatusResp | null>(null);

  const [proj, setProj] =
    useState<ApiProjResp | null>(null);

  const [ultra, setUltra] =
    useState<UltraResp | null>(null);

  /* =====================================================
     LOAD
  ===================================================== */

  async function loadAll() {

    try {

      setLoading(true);

      setError(null);

      const token =
        await getAccessToken();

      if (!token) {

        throw new Error(
          "Sessão inválida"
        );
      }

      const [
        s,
        p,
        u,
      ] = await Promise.all([

        fetchJson<ApiStatusResp>(
          "/api/engorda/status",
          token
        ),

        fetchJson<ApiProjResp>(
          "/api/engorda/projecao",
          token
        ),

        fetchJson<UltraResp>(
          "/api/engorda/ultra",
          token
        ),
      ]);

      setStatus(s);

      setProj(p);

      setUltra(u);

    } catch (e: any) {

      setError(
        e.message ??
        "Erro ao carregar Engorda"
      );

    } finally {

      setLoading(false);
    }
  }

  /* =====================================================
     EFFECT
  ===================================================== */

  useEffect(() => {

    loadAll();

  }, []);

  /* =====================================================
     STATES
  ===================================================== */

  if (loading) {

    return (

      <div
        className="
          p-10
          text-lg
          font-semibold
          text-slate-500
        "
      >
        Inicializando Runtime Cognitivo Engorda...
      </div>
    );
  }

  if (error) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-red-200
          bg-red-50
          p-8
          text-red-700
        "
      >
        {error}
      </div>
    );
  }

  /* =====================================================
     DATA
  ===================================================== */

  const total =
    ultra?.kpis?.total
    ?? proj?.total
    ?? 0;

  const margem =
    ultra?.kpis?.margem_media_top
    ?? proj?.margem_media_top
    ?? 0;

  const risco =
    ultra?.kpis?.risk_label
    ?? "BAIXO";

  const pi =
    ultra?.kpis?.pi_medio_top
    ?? 94;

  const compliance =
    100 -
    (
      ultra?.esg?.risco_ambiental_score
      ?? 0
    );

  const esg =
    ultra?.esg?.selo_verde_status
    ?? "VERDE";

  const alertas =
    ultra?.plano_acao?.map(
      (x: any) =>
        x?.acao
    )
    ?.filter(Boolean)
    ?? [];

  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <section
      className="
        space-y-8
      "
    >

      {/* =================================================
          EXECUTIVO
      ================================================= */}

      <EngordaExecutivePanel

        total={total}

        margem={Number(
          margem
        ).toFixed(2)}

        risco={risco}

        pi={pi}

        compliance={compliance}

        esg={esg}

        alertas={alertas}

      />

      {/* =================================================
          GRID
      ================================================= */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-3
        "
      >

        {/* =============================================
            TOTAL
        ============================================= */}

        <div
          className="
            rounded-[30px]
            border
            border-slate-200
            bg-white
            p-8
            shadow-sm
          "
        >

          <div
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.25em]
              text-slate-500
            "
          >
            Total Animais
          </div>

          <div
            className="
              mt-5
              text-6xl
              font-black
              text-slate-950
            "
          >
            {total}
          </div>

        </div>

        {/* =============================================
            MARGEM
        ============================================= */}

        <div
          className="
            rounded-[30px]
            border
            border-emerald-200
            bg-emerald-50
            p-8
            shadow-sm
          "
        >

          <div
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.25em]
              text-emerald-700
            "
          >
            Margem Média
          </div>

          <div
            className="
              mt-5
              text-5xl
              font-black
              text-emerald-950
            "
          >
            R$ {Number(margem).toFixed(2)}
          </div>

        </div>

        {/* =============================================
            RISCO
        ============================================= */}

        <div
          className="
            rounded-[30px]
            border
            border-amber-200
            bg-amber-50
            p-8
            shadow-sm
          "
        >

          <div
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.25em]
              text-amber-700
            "
          >
            Risco Operacional
          </div>

          <div
            className="
              mt-5
              text-5xl
              font-black
              text-amber-950
            "
          >
            {risco}
          </div>

        </div>

      </div>

      {/* =================================================
          TABELA
      ================================================= */}

      <div
        className="
          overflow-x-auto
          rounded-[34px]
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        <table
          className="
            min-w-full
            text-sm
          "
        >

          <thead
            className="
              bg-slate-50
            "
          >

            <tr>

              <th className="p-5 text-left font-bold text-slate-600">
                Brinco
              </th>

              <th className="p-5 text-left font-bold text-slate-600">
                Raça
              </th>

              <th className="p-5 text-left font-bold text-slate-600">
                Sexo
              </th>

            </tr>

          </thead>

          <tbody>

            {(status?.data ?? []).map(
              (
                item: any,
                idx: number
              ) => (

                <tr
                  key={idx}
                  className="
                    border-t
                    border-slate-100
                    hover:bg-emerald-50/40
                  "
                >

                  <td className="p-5 font-semibold">
                    {item?.brinco ?? "—"}
                  </td>

                  <td className="p-5">
                    {item?.raca ?? "—"}
                  </td>

                  <td className="p-5">
                    {item?.sexo ?? "—"}
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}