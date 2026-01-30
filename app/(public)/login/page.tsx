// app/(public)/login/page.tsx
// Página pública de login — arquitetura canônica PecuariaTech

import LoginClient from "./LoginClient";

export default function PublicLoginPage() {
  return (
    <main
      className="relative w-full flex justify-center px-4"
      style={{ minHeight: "100vh" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pecuariatech.png')" }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Cabeçalho */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-green-700">
              PecuariaTech
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Formulário */}
          <LoginClient />

        </div>
      </div>
    </main>
  );
}