import { Suspense } from "react";

import RegisterClient from "@/app/(public)/register/RegisterClient";

// app/cadastro/page.tsx

export default function CadastroPage() {
  return (
    <main
      className="
        relative
        min-h-screen
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >
      {/* BACKGROUND */}

      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          scale-105
        "
        style={{
          backgroundImage:
            "url('/pecuariatech.png')",
        }}
      />

      {/* OVERLAY AJUSTADO PREMIUM */}

      <div
        className="
          absolute
          inset-0
          bg-black/30
          backdrop-blur-[1.5px]
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          w-full
          flex
          items-center
          justify-center
          p-6
        "
      >
        <Suspense
          fallback={
            <div
              className="
                w-full
                max-w-xl
                rounded-3xl
                border
                border-emerald-200
                bg-emerald-50/95
                p-10
                text-center
                shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)]
                backdrop-blur-xl
              "
            >
              <div
                className="
                  text-sm
                  font-semibold
                  text-emerald-800
                "
              >
                Carregando cadastro...
              </div>
            </div>
          }
        >
          <RegisterClient />
        </Suspense>
      </div>
    </main>
  );
}
