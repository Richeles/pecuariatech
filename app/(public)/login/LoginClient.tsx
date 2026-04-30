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

  useEffect(() => {
    setLang(getLangFromClient());
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ LOGIN ERROR:", error);
      setError("Erro ao fazer login");
      setLoading(false);
      return;
    }

    // 🔥 ESSENCIAL: dar tempo pro cookie SSR
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 500);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">

      <input
        type="email"
        placeholder={t(lang, "email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded-lg"
      />

      <input
        type="password"
        placeholder={t(lang, "password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded-lg"
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
      >
        {loading ? "Entrando..." : t(lang, "enter")}
      </button>

      <div className="text-center text-sm mt-4 space-y-2">
        <p className="text-green-600 cursor-pointer">
          {t(lang, "create_account")}
        </p>

        <p className="text-gray-500 cursor-pointer">
          {t(lang, "forgot_password")}
        </p>
      </div>

    </form>
  );
}