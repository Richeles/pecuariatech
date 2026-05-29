"use client";

// =========================================================
// PECUARIATECH
// LOGIN CLIENT PREMIUM
// SSR COOKIE FIRST
// EQUAÇÃO Y + EQUAÇÃO Z
// RUNTIME COGNITIVO MULTILÍNGUE
// =========================================================

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  createBrowserClient,
} from "@/app/lib/supabase-browser";

/* =========================================================
   COMPONENT
========================================================= */

export default function LoginClient() {

  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOGIN
  ===================================================== */

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const supabase =
        createBrowserClient();

      /* =================================================
         AUTH LOGIN
      ================================================= */

      const {
        data,
        error,
      } =
        await supabase.auth
          .signInWithPassword({

            email:
              email.trim(),

            password,
          });

      /* =================================================
         ERROR
      ================================================= */

      if (error) {

        console.error(
          "LOGIN ERROR:",
          error.message
        );

        setError(
          "Email ou senha inválidos."
        );

        return;
      }

      /* =================================================
         SESSION VALIDATION
      ================================================= */

      if (!data?.session) {

        setError(
          "Sessão não encontrada."
        );

        return;
      }

      /* =================================================
         SSR COOKIE SYNC
      ================================================= */

      await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            access_token:
              data.session.access_token,
            refresh_token:
              data.session.refresh_token,
          }),
        }
      );

      /* =================================================
         CANONICAL MULTILANGUAGE ROUTE
      ================================================= */

      router.replace(
        "/pt/dashboard"
      );

      router.refresh();

    } catch (err) {

      console.error(
        "LOGIN FATAL:",
        err
      );

      setError(
        "Erro interno no login."
      );

    } finally {

      setLoading(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gradient-to-br
        from-[#07150f]
        via-[#0d1f17]
        to-[#10271d]
        px-6
      "
    >

      <div
        className="
          w-full
          max-w-[460px]
          rounded-[36px]
          border
          border-[#355845]
          bg-[#102018]/95
          p-10
          shadow-[0_0_80px_rgba(0,0,0,0.35)]
          backdrop-blur-2xl
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center">

          <div
            className="
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-[#355845]
              bg-[#173126]
              px-5
              py-3
              text-xs
              font-black
              uppercase
              tracking-[0.24em]
              text-[#d8f3dc]
            "
          >

            <div
              className="
                h-2
                w-2
                rounded-full
                bg-[#52b788]
                animate-pulse
              "
            />

            Runtime Cognitivo

          </div>

          <h1
            className="
              mt-8
              text-4xl
              font-black
              tracking-tight
              text-white
            "
          >
            PecuariaTech
          </h1>

          <p
            className="
              mt-4
              text-sm
              leading-relaxed
              text-[#b7d6c2]
            "
          >
            Plataforma operacional inteligente
            integrada ao runtime pecuário premium.
          </p>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleLogin}
          className="
            mt-10
            space-y-6
          "
        >

          {/* EMAIL */}

          <div>

            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-[#d8f3dc]
              "
            >
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-[#355845]
                bg-[#14281f]
                px-5
                py-4
                text-white
                outline-none
                transition-all
                duration-200
                placeholder:text-[#6c8a78]
                focus:border-[#52b788]
                focus:ring-2
                focus:ring-[#52b788]/20
              "
              placeholder="seu@email.com"
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-[#d8f3dc]
              "
            >
              Senha
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-[#355845]
                bg-[#14281f]
                px-5
                py-4
                text-white
                outline-none
                transition-all
                duration-200
                placeholder:text-[#6c8a78]
                focus:border-[#52b788]
                focus:ring-2
                focus:ring-[#52b788]/20
              "
              placeholder="••••••••"
            />

          </div>

          {/* ERROR */}

          {error ? (

            <div
              className="
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
                text-sm
                text-red-200
              "
            >
              {error}
            </div>

          ) : null}

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-2xl
              bg-gradient-to-r
              from-[#3B7D57]
              via-[#4D9A6D]
              to-[#2F6B4B]
              px-6
              py-4
              text-sm
              font-black
              uppercase
              tracking-[0.16em]
              text-white
              transition-all
              duration-300
              hover:scale-[1.01]
              hover:shadow-[0_0_30px_rgba(82,183,136,0.28)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
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