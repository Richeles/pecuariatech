import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">

      {/* IMAGEM DE FUNDO */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pecuariatech.png')" }}
      />

      {/* OVERLAY ESCURO */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CONTEÚDO CENTRAL */}
      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <Suspense fallback={<div />}>
          <RegisterClient />
        </Suspense>
      </div>

    </main>
  );
}