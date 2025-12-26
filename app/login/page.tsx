// CAMINHO: app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  // 🔑 EQUAÇÃO Y — CAPTURA DO RESET
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;

    if (hash.includes("type=recovery")) {
      // 🔥 Reset detectado → vai para página correta
      router.replace("/reset-password" + hash);
    }
  }, [router]);

  async function entrar() {
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
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
      </div>
    </main>
  );
}
