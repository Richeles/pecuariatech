// CAMINHO: app/login/page.tsx
// Next.js App Router + Supabase
// Login seguro com reset de senha e fallback de recovery (Equação Y)

"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [info, setInfo] = useState("");

  // 🔑 EQUAÇÃO Y — CAPTURA DE RECOVERY (LINK DO EMAIL)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;

    if (hash && hash.includes("type=recovery")) {
      router.replace("/reset-password" + hash);
    }
  }, [router]);

  // 🔐 LOGIN NORMAL
  async function entrar() {
    setErro("");
    setInfo("");

    if (!email || !senha) {
      setErro("Informe email e senha.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  }

  // 🔁 RESET DE SENHA (ENVIA EMAIL)
  async function resetarSenha() {
    setErro("");
    setInfo("");

    if (!email) {
      setErro("Informe seu email para redefinir a senha.");
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: "https://www.pecuariatech.com/reset-password",
      }
    );

    if (error) {
      setErro(error.message);
      return;
    }

    setInfo(
      "Email de redefinição enviado. Verifique sua caixa de entrada."
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#eef5ee]">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">
          Login · PecuariaTech
        </h1>

        {erro && (
          <p className="text-red-600 text-sm text-center">
            {erro}
          </p>
        )}

        {info && (
          <p className="text-green-700 text-sm text-center">
            {info}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border rounded px-3 py-2"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          onClick={entrar}
          className="w-full bg-green-600 text-white py-2 rounded font-semibold"
        >
          Entrar
        </button>

        {/* 🔁 ESQUECI MINHA SENHA */}
        <button
          type="button"
          onClick={resetarSenha}
          className="w-full text-sm text-green-700 hover:underline mt-2"
        >
          Esqueci minha senha
        </button>
      </div>
    </main>
  );
}
