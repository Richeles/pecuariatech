// app/cadastro/page.tsx

import RegisterClient from "@/app/(public)/register/RegisterClient";

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

        <RegisterClient />

      </div>

    </main>
  );
}