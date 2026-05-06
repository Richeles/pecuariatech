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

  // 🌍 carregar idioma
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

    } catch (err) {
      setErrorMsg("Erro inesperado no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">

      {/* 🔥 TÍTULO SAAS */}
      <h1 className="text-2xl font-bold text-green-700 text-center">
        {t(lang, "login_titulo")}
      </h1>

      <p className="text-sm text-gray-500 text-center mt-1 mb-6">
        {t(lang, "login_subtitulo")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* EMAIL */}
        <input
          type="email"
          placeholder={t(lang, "email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />

        {/* SENHA */}
        <input
          type="password"
          placeholder={t(lang, "password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
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
          className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-70 transition"
        >
          {loading ? t(lang, "processando") : t(lang, "enter")}
        </button>

      </form>

      {/* 🔥 LINKS PREMIUM (CORRIGIDO) */}
      <div className="flex justify-between text-sm mt-5 text-gray-600">

        <a href="/register" className="hover:underline">
          {t(lang, "create_account")}
        </a>

        <a href="/reset-password" className="hover:underline">
          {t(lang, "forgot_password")}
        </a>

      </div>
    </div>
  );
}