// CAMINHO: app/login/page.tsx
// Next.js 16 + TypeScript strict
// Login com recuperação de senha (Supabase)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setMensagem("Email ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleResetSenha() {
    if (!email) {
      setMensagem("Informe seu email para recuperar a senha.");
      return;
    }

    setLoading(true);
    setMensagem(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://127.0.0.1:3333/login",
    });

    if (error) {
      setMensagem("Erro ao enviar email de recuperação.");
      setLoading(false);
      return;
    }

    setMensagem("Email de recuperação enviado. Verifique sua caixa de entrada.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f7f3]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-green-700 text-center">
          Login • PecuariaTech
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full border rounded px-3 py-2"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={handleResetSenha}
          className="w-full text-sm text-green-700 underline"
        >
          Esqueci minha senha
        </button>

        {mensagem && (
          <p className="text-center text-sm text-red-600">{mensagem}</p>
        )}
      </form>
    </div>
  );
}
