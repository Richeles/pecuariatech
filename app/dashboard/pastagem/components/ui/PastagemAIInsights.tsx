"use client";

import { useEffect, useState } from "react";

export default function PastagemAIInsights() {

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("/api/ai/pastagem")

      .then((r) => r.json())

      .then((json) => {

        setData(json);

        setLoading(false);
      })

      .catch(() => {

        setLoading(false);
      });

  }, []);

  if (loading) {

    return (

      <section className="rounded-3xl border border-emerald-500/20 bg-[#031b11] p-8 text-white shadow-2xl">

        <div className="animate-pulse">

          Carregando IA estrutural...
        </div>

      </section>
    );
  }

  if (!data?.ok) {

    return (

      <section className="rounded-3xl border border-red-500/20 bg-red-950/40 p-8 text-red-200 shadow-2xl">

        Runtime de IA indisponível.
      </section>
    );
  }

  const d = data?.ai?.diagnostico;

  return (

    <section
      className="
        rounded-[36px]
        border
        border-emerald-500/20
        bg-gradient-to-br
        from-[#02150d]
        via-[#031b11]
        to-[#021008]
        p-8
        text-white
        shadow-2xl
      "
    >

      {/* HEADER */}

      <div className="flex items-start justify-between gap-6">

        <div>

          <div
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-4
              py-1
              text-xs
              font-bold
              text-emerald-300
            "
          >
            Runtime Cognitivo Online
          </div>

          <h2
            className="
              mt-5
              text-4xl
              font-black
            "
          >
            Pastagem Cognitive Engine
          </h2>

          <p
            className="
              mt-3
              max-w-3xl
              text-emerald-100/70
            "
          >
            Inteligência estrutural contínua da operação biológica e operacional da pastagem.
          </p>

        </div>

        <div
          className="
            rounded-2xl
            border
            border-emerald-500/20
            bg-[#0b1811]/70
            px-5
            py-3
            text-sm
            font-bold
            text-emerald-300
          "
        >
          PASTAGEM_AI_RUNTIME
        </div>

      </div>

      {/* KPI */}

      <div
        className="
          mt-10
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >

        <KPI
          label="Risco Estrutural"
          value={String(d?.risco ?? "-").toUpperCase()}
        />

        <KPI
          label="Score Estrutural"
          value={String(d?.score_estrutural ?? "-")}
        />

        <KPI
          label="Pressão Bioestrutural"
          value={String(d?.pressao_bioestrutural ?? "-")}
        />

        <KPI
          label="Risco Sanitário"
          value={String(d?.risco_sanitario_operacional ?? "-")}
        />

      </div>

      {/* ALERTAS */}

      <div className="mt-10">

        <div className="text-xl font-black">
          Alertas Operacionais
        </div>

        <div className="mt-5 space-y-3">

          {(d?.alertas ?? []).map(

            (item: string, idx: number) => (

              <div
                key={idx}
                className="
                  rounded-2xl
                  border
                  border-yellow-500/20
                  bg-yellow-500/10
                  p-4
                  text-yellow-100
                "
              >
                {item}
              </div>
            )
          )}

        </div>

      </div>

      {/* ADVISORY */}

      <div className="mt-10">

        <div className="text-xl font-black">
          Advisory Cognitivo
        </div>

        <div className="mt-5 space-y-3">

          {(d?.advisory ?? []).map(

            (item: string, idx: number) => (

              <div
                key={idx}
                className="
                  rounded-2xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  p-4
                  text-emerald-100
                "
              >
                {item}
              </div>
            )
          )}

        </div>

      </div>

    </section>
  );
}

function KPI({

  label,
  value,

}: {

  label: string;
  value: string;

}) {

  return (

    <div
      className="
        rounded-3xl
        border
        border-emerald-500/20
        bg-[#0a2117]/90
        p-6
      "
    >

      <div
        className="
          text-sm
          text-emerald-100/50
        "
      >
        {label}
      </div>

      <div
        className="
          mt-4
          text-3xl
          font-black
        "
      >
        {value}
      </div>

    </div>
  );
}