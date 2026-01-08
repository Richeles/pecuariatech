import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Imagem de fundo */}
      <Image
        src="/pecuariatech.png"
        alt="PecuariaTech - Campo e Rebanho"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Login · PecuariaTech
        </h1>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <button
            type="submit"
            className="w-full rounded bg-green-600 py-2 font-semibold text-white hover:bg-green-700"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 text-center">
          <a
            href="/reset-password"
            className="text-sm text-green-700 hover:underline"
          >
            Esqueci minha senha
          </a>
        </div>
      </div>
    </div>
  );
}
