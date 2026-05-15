"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  createBrowserClient,
} from "@/app/lib/supabase-browser";

import {
  getLangFromClient,
  Lang,
  setLangClient,
} from "@/app/lib/i18n";

/* =========================================================
   SUPABASE
========================================================= */

const supabase =
  createBrowserClient();

/* =========================================================
   COMPONENT
========================================================= */

export default function LoginClient() {

  const searchParams =
    useSearchParams();

  /* =====================================================
     NEXT ROUTE
  ===================================================== */

  const next =
    searchParams?.get("next")
    || "/dashboard";

  /* =====================================================
     STATES
  ===================================================== */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState<string | null>(
      null
    );

  const [lang, setLang] =
    useState<Lang>("pt");

  /* =====================================================
     CONTEXTO CHECKOUT
  ===================================================== */

  const [plano, setPlano] =
    useState<string | null>(
      null
    );

  const [periodo, setPeriodo] =
    useState<string | null>(
      null
    );

  /* =====================================================
     INIT
  ===================================================== */

  useEffect(() => {

    const detected =
      getLangFromClient();

    setLang(detected);

    try {

      const planoStorage =
        localStorage.getItem(
          "checkout_plano"
        );

      const periodoStorage =
        localStorage.getItem(
          "checkout_periodo"
        );

      setPlano(
        planoStorage
      );

      setPeriodo(
        periodoStorage
      );

    } catch (
      err
    ) {

      console.error(
        "LOCAL STORAGE ERROR:",
        err
      );
    }

    setMounted(true);

  }, []);

  /* =====================================================
     LABELS
  ===================================================== */

  function getPlanoLabel() {

    switch (plano) {

      case "basico":

        return lang === "pt"
          ? "Plano Básico"
          : "Plan Básico";

      case "profissional":

        return lang === "pt"
          ? "Plano Profissional"
          : "Plan Profesional";

      case "ultra":

        return "Ultra";

      case "empresarial":

        return lang === "pt"
          ? "Plano Empresarial"
          : "Plan Empresarial";

      case "premium_dominus":

        return "Premium Dominus 360°";

      default:

        return null;
    }
  }

  function getPeriodoLabel() {

    switch (periodo) {

      case "mensal":

        return lang === "pt"
          ? "Mensal"
          : "Mensual";

      case "trimestral":

        return "Trimestral";

      case "anual":

        return "Anual";

      default:

        return null;
    }
  }

  /* =====================================================
     LOGIN FLOW
  ===================================================== */

  async function handleSubmit(
    e?: React.FormEvent
  ) {

    e?.preventDefault();

    if (loading) {
      return;
    }

    console.log(
      "🔥 LOGIN START"
    );

    setLoading(true);

    setErrorMsg(null);

    try {

      /* ==========================================
         LOGIN SUPABASE
      ========================================== */

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

      console.log(
        "AUTH RESPONSE:",
        {
          user:
            data?.user?.email,
          session:
            !!data?.session,
          error,
        }
      );

      /* ==========================================
         LOGIN ERROR
      ========================================== */

      if (error) {

        console.error(
          "LOGIN ERROR:",
          error
        );

        setErrorMsg(

          lang === "pt"

            ? "Email ou senha inválidos."

            : "Email o contraseña inválidos."
        );

        return;
      }

      /* ==========================================
         SESSION CHECK
      ========================================== */

      if (
        !data?.session
      ) {

        console.error(
          "NO SESSION"
        );

        setErrorMsg(

          lang === "pt"

            ? "Sessão não criada."

            : "Sesión no creada."
        );

        return;
      }

      console.log(
        "✅ SESSION OK"
      );

      /* ==========================================
         AGUARDA COOKIE SSR
      ========================================== */

      await new Promise(
        (resolve) =>

          setTimeout(
            resolve,
            2200
          )
      );

      /* ==========================================
         VALIDAR ASSINATURA
      ========================================== */

      const response =
        await fetch(

          "/api/assinaturas/status",

          {
            method: "GET",

            credentials:
              "include",

            cache:
              "no-store",
          }
        );

      /* ==========================================
         RESPONSE ERROR
      ========================================== */

      if (!response.ok) {

        console.error(
          "STATUS RESPONSE ERROR:",
          response.status
        );

        setErrorMsg(

          lang === "pt"

            ? "Erro ao validar assinatura."

            : "Error al validar suscripción."
        );

        return;
      }

      const assinatura =
        await response.json();

      console.log(
        "📦 ASSINATURA:",
        assinatura
      );

      /* ==========================================
         CONTEXTO CHECKOUT
      ========================================== */

      if (
        plano &&
        periodo
      ) {

        console.log(
          "🟢 REDIRECT CHECKOUT"
        );

        window.location.href =
          `/checkout?plano=${plano}&periodo=${periodo}`;

        return;
      }

      /* ==========================================
         ASSINATURA ATIVA
      ========================================== */

      if (
        assinatura?.ativo === true
      ) {

        console.log(
          "🟢 REDIRECT DASHBOARD"
        );

        window.location.href =
          next;

        return;
      }

      /* ==========================================
         SEM ASSINATURA
      ========================================== */

      console.log(
        "🟡 REDIRECT PLANOS"
      );

      window.location.href =
        "/planos";

    } catch (err) {

      console.error(
        "💥 LOGIN FATAL:",
        err
      );

      setErrorMsg(

        lang === "pt"

          ? "Erro inesperado no login."

          : "Error inesperado."
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
        space-y-6
      "
    >

      {/* =================================================
          CONTEXTO ASSINATURA
      ================================================= */}

      {mounted &&
        plano &&
        periodo && (

        <div
          className="
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50/90
            p-4
            shadow-sm
          "
        >

          <div
            className="
              text-[11px]
              font-black
              uppercase
              tracking-widest
              text-emerald-700
            "
          >

            {
              lang === "pt"

                ? "Continuidade da Assinatura"

                : "Continuidad de Suscripción"
            }

          </div>

          <div
            className="
              mt-3
              text-sm
              text-emerald-900
            "
          >

            <div
              className="
                font-bold
              "
            >
              {getPlanoLabel()}
            </div>

            <div
              className="
                mt-1
                text-emerald-700
              "
            >
              {getPeriodoLabel()}
            </div>

          </div>

        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="
          space-y-4
        "
      >

        <input
          type="email"
          autoComplete="email"
          placeholder={
            lang === "pt"
              ? "Seu email"
              : "Tu email"
          }
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="
            w-full
            rounded-xl
            border
            border-neutral-200
            bg-white/95
            px-4
            py-3
            outline-none
            transition-all
            focus:border-green-600
            focus:ring-2
            focus:ring-green-600/20
          "
          required
        />

        <input
          type="password"
          autoComplete="current-password"
          placeholder={
            lang === "pt"
              ? "Sua senha"
              : "Tu contraseña"
          }
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="
            w-full
            rounded-xl
            border
            border-neutral-200
            bg-white/95
            px-4
            py-3
            outline-none
            transition-all
            focus:border-green-600
            focus:ring-2
            focus:ring-green-600/20
          "
          required
        />

        {errorMsg && (

          <div
            className="
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            rounded-xl
            bg-gradient-to-r
            from-green-600
            to-emerald-700
            py-3
            font-black
            uppercase
            tracking-wide
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:scale-[1.01]
            hover:shadow-2xl
            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >

          {loading

            ? (
              lang === "pt"
                ? "Processando..."
                : "Procesando..."
            )

            : (
              lang === "pt"
                ? "Entrar"
                : "Ingresar"
            )}

        </button>

      </form>

      {/* =================================================
          LANG SWITCH
      ================================================= */}

      <div
        className="
          flex
          items-center
          justify-center
          gap-3
          pt-2
          text-sm
        "
      >

        <button
          type="button"
          onClick={() => {

            setLang("pt");

            setLangClient("pt");
          }}
          className={`
            transition-all

            ${
              lang === "pt"

                ? "font-black text-green-700"

                : "text-neutral-500"
            }
          `}
        >
          🇧🇷 PT
        </button>

        <button
          type="button"
          onClick={() => {

            setLang("es");

            setLangClient("es");
          }}
          className={`
            transition-all

            ${
              lang === "es"

                ? "font-black text-green-700"

                : "text-neutral-500"
            }
          `}
        >
          🇪🇸 ES
        </button>

      </div>

    </div>
  );
}