"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams?.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // ✅ Login SSR (cookie) — cria sessão que o middleware enxerga
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const j = await r.json().catch(() => null);

      if (!r.ok || !j?.ok) {
        setErrorMsg(j?.error || "Falha no login. Verifique email e senha.");
        setLoading(false);
        return;
      }

      // ✅ Redirecionamento canônico (SSR cookie já criado)
      router.replace(next);
      router.refresh();
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
