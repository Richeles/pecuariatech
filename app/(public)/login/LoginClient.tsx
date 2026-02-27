"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase-browser";

export default function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErro(null);

    try {
      // ===============================
      // LOGIN
      // ===============================
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha.trim(),
      });

      if (error) {
        setErro(error.message);
        setLoading(false);
        return;
      }

      // ✅ SINCRONIZAÇÃO CRÍTICA DA SESSÃO
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session) {
        setErro("Falha ao estabelecer sessão. Tente novamente.");
        setLoading(false);
        return;
      }

      // ===============================
      // CONSULTA IDENTIDADE ADMIN
      // ===============================
      try {
        const res = await fetch("/api/admin/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          router.replace("/dashboard");
          return;
        }

        const data = await res.json();

        if (data?.is_admin === true) {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard");
        }
      } catch {
        router.replace("/dashboard");
      }

    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      setErro("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={entrar} className="space-y-4">
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
        className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {/* LINKS AUXILIARES */}
      <div className="flex flex-col items-center gap-2 pt-3 text-sm">

        <Link
          href="/register"
          className="text-green-700 hover:underline font-medium"
        >
          Criar conta
        </Link>

        <Link
          href="/reset-password"
          className="text-green-700 hover:underline"
        >
          Esqueci minha senha
        </Link>

      </div>
    </form>
  );
}