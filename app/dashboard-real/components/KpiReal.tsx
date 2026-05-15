"use client";

import React from "react";

/* =====================================================
   TYPES
===================================================== */

interface KpiProps {

  title: string;

  value: number | string;

  subtitulo?: string;
}

/* =====================================================
   COMPONENT
===================================================== */

export function KpiReal({
  title,
  value,
  subtitulo,
}: KpiProps) {

  return (

    <div
      className="
        min-w-[220px]
        rounded-3xl
        border
        border-emerald-100
        bg-white/90
        p-6
        shadow-xl
        backdrop-blur-xl
      "
    >

      {/* =====================================
          TITLE
      ===================================== */}

      <div
        className="
          text-xs
          font-black
          uppercase
          tracking-[0.2em]
          text-emerald-700
        "
      >
        {title}
      </div>

      {/* =====================================
          VALUE
      ===================================== */}

      <div
        className="
          mt-4
          text-4xl
          font-black
          tracking-tight
          text-emerald-950
        "
      >
        {value}
      </div>

      {/* =====================================
          SUBTITLE
      ===================================== */}

      {subtitulo && (

        <div
          className="
            mt-3
            text-sm
            text-neutral-500
          "
        >
          {subtitulo}
        </div>
      )}

    </div>
  );
}