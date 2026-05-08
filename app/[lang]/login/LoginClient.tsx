"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";
import { getLangFromClient, t, Lang } from "@/app/lib/i18n";

const supabase = createClient();

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const lang = (params?.lang as Lang) || "pt";

  const next =
    searchParams?.get("next") || `/${lang}/dashboard`;

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

      if (error || !data?.session) {
        setErrorMsg("Falha no login.");
        return;
      }

      // 🔥 CRÍTICO: força SSR cookie sync
      window.location.href = next;

    } catch {
      setErrorMsg("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="email"
        placeholder={t(lang, "email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-4 py-2"
        required
      />

      <input
        type="password"
        placeholder={t(lang, "password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded border px-4 py-2"
        required
      />

      {errorMsg && (
        <div className="text-red-600 text-sm">{errorMsg}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        {loading ? t(lang, "processando") : t(lang, "enter")}
      </button>

      <div className="text-center text-sm mt-3 space-y-1">
        <a href={`/${lang}/register`} className="text-green-700">
          {t(lang, "create_account")}
        </a>
        <br />
        <a href={`/${lang}/forgot-password`} className="text-gray-500">
          {t(lang, "forgot_password")}
        </a>
      </div>

    </form>
  );
}