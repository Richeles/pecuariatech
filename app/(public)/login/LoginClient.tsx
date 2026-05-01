"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";
import { getLangFromClient, t, Lang } from "@/app/lib/i18n";

export default function LoginClient() {
  const supabase = createClient();
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("pt");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // idioma
  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  // 🔒 helper: aguarda sessão realmente disponível (evita redirect prematuro)
  const waitForSession = async (timeoutMs = 3000) => {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) return true;

      await new Promise((r) => setTimeout(r, 150));
    }

    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("LOGIN ERROR:", error);
      setError(error.message || "Erro ao fazer login");
      setLoading(false);
      return;
    }

    // ⛳ garante que a sessão está disponível antes de navegar
    const ok = await waitForSession();

    if (!ok) {
      setError("Sessão não consolidada. Tente novamente.");
      setLoading(false);
      return;
    }

    // 🔄 navegação pós-login
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder={t(lang, "email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded-lg"
        required
      />

      <input
        type="password"
        placeholder={t(lang, "password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded-lg"
        required
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Entrando..." : t(lang, "enter")}
      </button>

      <div className="text-center text-sm mt-4 space-y-2">
        <a href="/register" className="text-green-600">
          {t(lang, "create_account")}
        </a>

        <a href="/reset-password" className="text-gray-500">
          {t(lang, "forgot_password")}
        </a>
      </div>
    </form>
  );
}