"use client";

import { useState } from "react";

import Link from "next/link";

import Image from "next/image";

import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";

import LanguageSwitcher
from "@/app/components/i18n/LanguageSwitcher";

export default function LoginClient() {

  const router = useRouter();

  const pathname = usePathname();

  const searchParams =
    useSearchParams();

  const nextUrl =
    searchParams.get("next");

  // 🔥 LOG ADICIONADO PARA DIAGNOSTICAR A NEXT URL
  console.log("🚨 NEXT URL RECEBIDA:", nextUrl);

  const locale =
    pathname?.split("/")[1] || "pt";

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const texts = {

    pt: {

      subtitle:
        "Inteligência operacional pecuária",

      email:
        "Email",

      password:
        "Senha",

      enter:
        "Entrar",

      entering:
        "Entrando...",

      forgot:
        "Esqueci minha senha",

      invalid:
        "Email ou senha inválidos.",

      internal:
        "Erro interno no login.",
    },

    es: {

      subtitle:
        "Inteligencia operacional ganadera",

      email:
        "Correo",

      password:
        "Contraseña",

      enter:
        "Ingresar",

      entering:
        "Ingresando...",

      forgot:
        "Olvidé mi contraseña",

      invalid:
        "Correo o contraseña inválidos.",

      internal:
        "Error interno de login.",
    },
  };

  const t =
    locale === "es"
      ? texts.es
      : texts.pt;

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    setError("");

    try {

      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body: JSON.stringify({

              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        console.error(
          "❌ LOGIN SSR ERROR:",
          data
        );

        setError(
          t.invalid
        );

        return;
      }

      console.log(
        "🟢 LOGIN SSR OK"
      );

      // aguarda cookies SSR

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1200
          )
      );

      const statusRes =
        await fetch(
          `/api/assinaturas/status?ts=${Date.now()}`,
          {
            credentials:
              "include",
          }
        );

      const status =
        await statusRes.json();

      console.log(
        "🧠 STATUS:",
        status
      );

      /* =========================================
         RESPEITA NEXT URL - MODIFICADO
         🔥 LOG ADICIONADO PARA DEBUG
      ========================================= */

      if (nextUrl) {

        // 🔥 LOG CRÍTICO - MOSTRA A URL QUE SERÁ USADA
        console.log("🔍 NEXT URL =", nextUrl);

        window.location.href = nextUrl;

      } else if (status?.ativo) {

        router.push(

          locale === "es"

            ? "/es/dashboard"

            : "/pt/dashboard"
        );

      } else {

        console.warn(
          "⚠️ Usuário sem assinatura ativa"
        );

        router.push(

          locale === "es"

            ? "/es/planos"

            : "/pt/planos"
        );
      }

      router.refresh();

    } catch (err) {

      console.error(
        "💥 LOGIN ERROR:",
        err
      );

      setError(
        t.internal
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">

      {/* BACKGROUND PREMIUM */}

      <div className="absolute inset-0">

        <Image
          src="/pecuariatech.png"
          alt="PecuariaTech"
          fill
          priority
          quality={100}
          className="
            object-cover
            object-center
            opacity-100
            scale-105
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/0
          "
        />

      </div>

      {/* LANGUAGE */}

      <div
        className="
          absolute
          right-6
          top-6
          z-20
        "
      >

        <LanguageSwitcher />

      </div>

      {/* CARD */}

      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-white/95 p-10 shadow-2xl backdrop-blur-xl">

        {/* HEADER */}

        <div className="text-center">

          <h1
            className="
              text-5xl
              font-black
              tracking-tight
              text-green-600
              drop-shadow-[0_0_15px_rgba(34,197,94,0.25)]
            "
          >
            PecuariaTech
          </h1>

          <p className="mt-4 text-neutral-600">

            {t.subtitle}

          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-5"
        >

          {/* EMAIL */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-neutral-700">

              {t.email}
            </label>

            <input
              type="email"
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
                border-neutral-300
                bg-white
                px-4
                py-3
                outline-none
                transition
                focus:border-green-600
              "
              placeholder={
                locale === "es"
                  ? "tu@email.com"
                  : "seu@email.com"
              }
              required
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-neutral-700">

              {t.password}
            </label>

            <input
              type="password"
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
                border-neutral-300
                bg-white
                px-4
                py-3
                outline-none
                transition
                focus:border-green-700
              "
              placeholder="••••••••"
              required
            />

          </div>

          {/* ERROR */}

          {error && (

            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              {error}
            </div>

          )}

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-green-800 px-4 py-3 font-black text-white transition hover:bg-green-900 disabled:opacity-50"
          >

            {loading
              ? t.entering
              : t.enter}

          </button>

          {/* RESET */}

          <div className="pt-2 text-center">

            <Link
              href={
                locale === "es"
                  ? "/es/reset-password"
                  : "/pt/reset-password"
              }
              className="
                text-sm
                font-semibold
                text-green-700
                transition
                hover:text-green-800
                hover:underline
              "
            >

              {t.forgot}
            </Link>

          </div>

        </form>

      </div>

    </div>
  );
}