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

      // ===============================
      // VERIFICA ASSINATURA
      // ===============================
      try {
        const res = await fetch("/api/assinaturas/status", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();

        // Admin override
        if (data?.reason === "admin_override") {
          router.replace("/dashboard/admin");
          return;
        }

        // Assinatura ativa
        if (data?.ativo === true) {
          router.replace("/dashboard");
          return;
        }

        // Usuário novo → escolher plano
        router.replace("/planos");

      } catch {
        router.replace("/login");
      }

    } catch (err) {
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