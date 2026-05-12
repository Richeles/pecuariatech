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

      {/* OVERLAY */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-black/70
          via-black/60
          to-black/80
          backdrop-blur-sm
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