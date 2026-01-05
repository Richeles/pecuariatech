"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <form
        onSubmit={entrar}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-center">
          Login · PecuariaTech
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

        {erro && (
          <p className="text-red-600 text-sm text-center">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/reset-password"
            className="text-sm text-green-700 hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </main>
  );
}
