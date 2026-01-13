import Image from "next/image";
import LoginClient from "./components/LoginClient";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Image
        src="/pecuariatech.png"
        alt="PecuariaTech - Campo e Rebanho"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Login · PecuariaTech
        </h1>

        <LoginClient />

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
