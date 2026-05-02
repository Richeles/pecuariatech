"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase-browser";
import { getLangFromClient, t, Lang } from "@/app/lib/i18n";

export default function LoginClient() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());

  const [lang, setLang] = useState<Lang>("pt");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  // 🔥 DEBUG DE SESSÃO
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH EVENT:", event);
      console.log("SESSION:", session);
    });
  }, [supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("LOGIN ERROR:", error);
      setError(error.message);
      setLoading(false);
      return;
    }

    console.log("LOGIN SUCCESS:", data);

    // 🔥 força persistência antes de navegar
    await new Promise((r) => setTimeout(r, 800));

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
        className="w-full bg-green-600 text-white py-3 rounded-lg"
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