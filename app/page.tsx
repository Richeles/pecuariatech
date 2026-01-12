import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* FUNDO HD PREMIUM */}
      <Image
        src="/bois-header.png"
        alt="Pecuária moderna e sustentável"
        fill
        priority
        className="
          object-cover
          brightness-[1.30]
          contrast-[1.18]
          saturate-[1.12]
        "
      />

      {/* Sharpen leve (simula nitidez premium, sem plugins) */}
      <div className="absolute inset-0 backdrop-contrast-125 backdrop-saturate-125" />

      {/* Overlay ULTRA leve (não escurece, só estabiliza a leitura) */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Vinheta bem suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.10),rgba(0,0,0,0.35))]" />

      {/* Conteúdo */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        {/* Card invisível “glass” para destacar letras sem matar a imagem */}
        <div className="mx-auto inline-block rounded-3xl px-8 py-10 md:px-14 md:py-12 bg-black/20 backdrop-blur-md border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          {/* Nome */}
          <h1 className="text-white text-6xl md:text-8xl font-extrabold tracking-tight drop-shadow-[0_10px_28px_rgba(0,0,0,0.60)]">
            PecuariaTech
          </h1>

          {/* FRASE PRINCIPAL — MUITO MAIOR e verde */}
          <p className="mt-6 text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]">
            <span className="text-green-300">
              Gestão pecuária inteligente para quem busca controle real,
              decisões seguras e crescimento sustentável.
            </span>
          </p>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="
                w-full sm:w-auto
                px-12 py-4
                rounded-2xl
                bg-green-600
                text-white
                text-xl
                font-extrabold
                shadow-lg
                hover:bg-green-700
                hover:shadow-xl
                transition
              "
            >
              Entrar
            </Link>

            <Link
              href="/planos"
              className="
                w-full sm:w-auto
                px-12 py-4
                rounded-2xl
                border border-white/60
                text-white
                text-xl
                font-extrabold
                backdrop-blur-md
                bg-white/10
                hover:bg-white
                hover:text-green-800
                transition
                shadow-lg
              "
            >
              Ver Planos
            </Link>
          </div>

          {/* Microcopy */}
          <p className="mt-10 text-base md:text-lg text-white/80">
            Plataforma profissional com módulos: Rebanho, Pastagem, Financeiro e Engorda ULTRA.
          </p>
        </div>
      </div>

      {/* Cinema look */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.45)]" />
    </main>
  );
}
