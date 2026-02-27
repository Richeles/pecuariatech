import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/pecuariatech.png')" }}
      />

      {/* OVERLAY GRADIENT PREMIUM */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80 backdrop-blur-sm" />

      {/* CONTEÚDO */}
      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <Suspense fallback={<div />}>
          <RegisterClient />
        </Suspense>
      </div>

    </main>
  );
}