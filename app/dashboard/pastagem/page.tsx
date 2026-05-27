// app/dashboard/pastagem/page.tsx

import React, { Suspense } from "react";
import PastagemSafe from "./components/PastagemSafe";

export const dynamic = "force-dynamic";

export default function PastagemPage() {

  return (

    <main className="p-10 max-w-7xl mx-auto space-y-12">

      {/* ================= HEADER ================= */}

      <header className="space-y-3">

        <h1
          className="
            text-4xl
            font-black
            tracking-tight
            text-[#183a2d]
          "
        >
          Pastagem
        </h1>

        <p
          className="
            text-base
            leading-relaxed
            text-[#567564]
          "
        >
          Gestão operacional das áreas,
          pressão de pastejo e risco produtivo
        </p>

      </header>

      {/* ================= CONTEÚDO ================= */}

      <Suspense
        fallback={
          <p
            className="
              text-sm
              font-medium
              text-[#567564]
            "
          >
            Carregando Pastagem…
          </p>
        }
      >

        <PastagemSafe />

      </Suspense>

    </main>
  );
}