"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function DashboardRealLayout({
  children,
}: Props) {

  return (

    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-neutral-50
        via-white
        to-emerald-50
      "
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <header
        className="
          border-b
          border-emerald-100
          bg-white/90
          backdrop-blur-xl
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-6
            py-4
          "
        >

          <div>

            <div
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-emerald-700
              "
            >
              PecuariaTech
            </div>

            <h1
              className="
                mt-1
                text-2xl
                font-black
                tracking-tight
                text-emerald-950
              "
            >
              Dashboard Real
            </h1>

          </div>

        </div>

      </header>

      {/* =====================================
          CONTENT
      ===================================== */}

      <main
        className="
          mx-auto
          max-w-7xl
          p-6
        "
      >
        {children}
      </main>

    </div>
  );
}