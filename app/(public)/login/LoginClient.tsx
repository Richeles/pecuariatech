"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";
import { getLangFromClient, t, Lang } from "@/app/lib/i18n";

const supabase = createClient();

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams?.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data?.session) {
        setErrorMsg("Falha no login. Verifique email e senha.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setErrorMsg("Erro inesperado no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* EMAIL */}
      <input
        type="email"
        placeholder={t(lang, "email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        required
      />

      {/* SENHA */}
      <input
        type="password"
        placeholder={t(lang, "password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        required
      />

      {/* ERRO */}
      {errorMsg && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* BOTÃO */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-70"
      >
        {loading ? t(lang, "processando") : t(lang, "enter")}
      </button>

      {/* 🔥 LINKS ORGANIZADOS (CORREÇÃO) */}
      <div className="flex flex-col items-center gap-2 mt-3 text-sm">

        <a
          href="/register"
          className="text-green-700 hover:underline font-medium"
        >
          {t(lang, "create_account")}
        </a>

        <a
          href="/forgot-password"
          className="text-gray-500 hover:underline"
        >
          {t(lang, "forgot_password")}
        </a>

      </div>

    </form>
  );
}