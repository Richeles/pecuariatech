"use client";

// =========================================================
// PECUARIATECH
// LOGIN CLIENT PREMIUM
// SSR COOKIE FIRST
// EQUA??O Y + EQUA??O Z
// RUNTIME COGNITIVO MULTIL?NGUE
// =========================================================

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/app/lib/supabase-browser";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserClient();

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (authError) {
        console.error(
          "[LOGIN_CLIENT] AUTH_ERROR:",
          authError.message
        );
        setError("E-mail ou senha inv?lidos.");
        return;
      }

      if (!data?.session) {
        setError("Sess?o n?o encontrada.");
        return;
      }

      const loginResponse = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const loginBody =
        await loginResponse
          .json()
          .catch(() => null);

      if (!loginResponse.ok) {
        console.error(
          "[LOGIN_CLIENT] SSR_ERROR:",
          loginBody
        );

        setError(
          loginBody?.error ||
            "N?o foi poss?vel estabelecer a sess?o segura."
        );

        return;
      }

      if (nextUrl) {
        window.location.href = nextUrl;
        return;
      }

      router.replace("/pt/dashboard");
      router.refresh();
    } catch (err) {
      console.error(
        "[LOGIN_CLIENT] FATAL:",
        err
      );

      setError("Erro interno no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#07150f] via-[#0d1f17] to-[#10271d] px-6">
      <div className="w-full max-w-[460px] rounded-[36px] border border-[#355845] bg-[#102018]/95 p-10 shadow-[0_0_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

        <div className="text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#355845] bg-[#173126] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-[#d8f3dc]">
            <div className="h-2 w-2 rounded-full bg-[#52b788] animate-pulse" />
            Runtime Cognitivo
          </div>

          <h1 className="mt-8 text-4xl font-black tracking-tight text-white">
            PecuariaTech
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-[#b7d6c2]">
            Plataforma operacional inteligente
            integrada ao runtime pecu?rio premium.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-6"
        >

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#d8f3dc]">
              E-mail
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-2xl border border-[#355845] bg-[#14281f] px-5 py-4 text-white outline-none transition-all duration-200 placeholder:text-[#6c8a78] focus:border-[#52b788] focus:ring-2 focus:ring-[#52b788]/20"
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#d8f3dc]">
              Senha
            </label>

            <div className="relative">
              <input
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-2xl border border-[#355845] bg-[#14281f] px-5 py-4 pr-24 text-white outline-none transition-all duration-200 placeholder:text-[#6c8a78] focus:border-[#52b788] focus:ring-2 focus:ring-[#52b788]/20"
                placeholder="????????"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarSenha(
                    (valor) => !valor
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9bd6af] transition-colors hover:text-white"
                aria-label={
                  mostrarSenha
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {mostrarSenha
                  ? "Ocultar"
                  : "Mostrar"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#3B7D57] via-[#4D9A6D] to-[#2F6B4B] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(82,183,136,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Entrando..."
              : "Acessar Plataforma"}
          </button>
        </form>
      </div>
    </div>
  );
}
