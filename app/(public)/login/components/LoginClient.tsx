"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase-browser";

export default function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // ✅ Garantia de sessão real
      if (!data?.session?.access_token) {
        setErrorMsg("Falha ao criar sessão. Tente novamente.");
        setLoading(false);
        return;
      }

      // ✅ Redirect canônico (não usar push)
      router.replace("/dashboard");
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro inesperado no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        required
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        required
      />

      {errorMsg && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-70"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
