import Link from "next/link";

export default function HomePage() {

  return (

    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-black
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

      {/* OVERLAY MAIS CLARO */}

      <div
        className="
          absolute
          inset-0
          bg-black/15
        "
      />

      {/* LIGHT EFFECT MAIS SUAVE */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/15
          via-transparent
          to-black/5
        "
      />

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          max-w-5xl
          px-6
          text-center
        "
      >

        {/* BADGE */}

        <div
          className="
            inline-flex
            items-center
            gap-3
            rounded-full
            border
            border-green-400/30
            bg-green-500/10
            px-5
            py-3
            text-xs
            font-black
            uppercase
            tracking-[0.24em]
            text-green-200
            backdrop-blur-sm
          "
        >

          <div
            className="
              h-2
              w-2
              rounded-full
              bg-green-400
              animate-pulse
            "
          />

          Runtime Cognitivo Online

        </div>

        {/* TITLE */}

        <h1
          className="
            mt-8
            text-6xl
            font-black
            tracking-tight
            text-green-400
            drop-shadow-[0_0_25px_rgba(34,197,94,0.35)]
            xl:text-8xl
          "
        >
          PecuariaTech
        </h1>

        {/* SUBTITLE */}

        <p
          className="
            mt-8
            text-lg
            leading-9
            text-neutral-100
            drop-shadow-lg
            xl:text-2xl
          "
        >
          Plataforma operacional cognitiva
          para gestão financeira,
          rebanho, pastagem,
          engorda e inteligência pecuária.
        </p>

        {/* BUTTONS */}

        <div
          className="
            mt-12
            flex
            flex-col
            gap-5
            md:flex-row
            md:justify-center
          "
        >

          {/* LOGIN */}

          <Link
            href="/pt/login"
            prefetch={false}
            className="
              rounded-2xl
              bg-green-500
              px-10
              py-5
              text-lg
              font-black
              text-white
              transition-all
              duration-300
              hover:scale-105
              hover:bg-green-400
              hover:shadow-[0_0_35px_rgba(34,197,94,0.45)]
            "
          >
            Entrar
          </Link>

          {/* PLANOS */}

          <Link
            href="/pt/planos"
            prefetch={false}
            className="
              rounded-2xl
              border
              border-white/20
              bg-black/20
              px-10
              py-5
              text-lg
              font-black
              text-white
              backdrop-blur-sm
              transition-all
              duration-300
              hover:scale-105
              hover:bg-white/10
            "
          >
            Ver Planos
          </Link>

          {/* CADASTRO */}

          <Link
            href="/cadastro"
            prefetch={false}
            className="
              rounded-2xl
              border
              border-green-400/40
              bg-green-500/10
              px-10
              py-5
              text-lg
              font-black
              text-white
              backdrop-blur-sm
              transition-all
              duration-300
              hover:scale-105
              hover:bg-green-500/20
              hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]
            "
          >
            Criar Conta
          </Link>

        </div>

      </div>

    </main>
  );
}