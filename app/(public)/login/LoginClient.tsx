"use client";

import {
  useState,
  useEffect,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  createClient,
} from "@/app/lib/supabase-browser";

import {
  getLangFromClient,
  t,
  Lang,
  setLangClient,
} from "@/app/lib/i18n";

const supabase =
  createClient();

export default function LoginClient() {

  const searchParams =
    useSearchParams();

  /* =====================================================
     NEXT
  ===================================================== */

  const next =
    searchParams?.get("next") ||
    "/dashboard";

  /* =====================================================
     STATES
  ===================================================== */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState<string | null>(null);

  const [lang, setLang] =
    useState<Lang>("pt");

  const [mounted, setMounted] =
    useState(false);

  /* =====================================================
     ONBOARDING CONTEXT
  ===================================================== */

  const [plano, setPlano] =
    useState<string | null>(null);

  const [periodo, setPeriodo] =
    useState<string | null>(null);

  /* =====================================================
     LANG + CONTEXTO
  ===================================================== */

  useEffect(() => {

    const detected =
      getLangFromClient();

    setLang(detected);

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

    setMounted(true);

  }, []);

  /* =====================================================
     LABELS
  ===================================================== */

  function getPlanoLabel() {

    if (
      plano === "basico"
    ) {

      return (
        lang === "pt"
          ? "Plano Básico"
          : lang === "es"
          ? "Plan Básico"
          : "Basic Plan"
      );
    }

    if (
      plano === "profissional"
    ) {

      return (
        lang === "pt"
          ? "Plano Profissional"
          : lang === "es"
          ? "Plan Profesional"
          : "Professional Plan"
      );
    }

    if (
      plano === "ultra"
    ) {

      return "Ultra";
    }

    if (
      plano === "empresarial"
    ) {

      return (
        lang === "pt"
          ? "Plano Empresarial"
          : lang === "es"
          ? "Plan Empresarial"
          : "Enterprise Plan"
      );
    }

    if (
      plano === "premium_dominus"
    ) {

      return "Premium Dominus 360°";
    }

    return null;
  }

  function getPeriodoLabel() {

    if (
      periodo === "mensal"
    ) {

      return (
        lang === "pt"
          ? "Mensal"
          : lang === "es"
          ? "Mensual"
          : "Monthly"
      );
    }

    if (
      periodo === "trimestral"
    ) {

      return (
        lang === "pt"
          ? "Trimestral"
          : lang === "es"
          ? "Trimestral"
          : "Quarterly"
      );
    }

    if (
      periodo === "anual"
    ) {

      return (
        lang === "pt"
          ? "Anual"
          : lang === "es"
          ? "Anual"
          : "Yearly"
      );
    }

    return null;
  }

  /* =====================================================
     LOGIN
  ===================================================== */

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setErrorMsg(null);

    setLoading(true);

    try {

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({

          email:
            email.trim(),

          password,
        });

      /* ==========================================
         ERRO REAL
      ========================================== */

      if (error) {

        console.error(
          error
        );

        setErrorMsg(
          error.message
        );

        return;
      }

      if (
        !data?.session
      ) {

        setErrorMsg(

          lang === "pt"

            ? "Sessão não criada."

            : lang === "es"

            ? "Sesión no creada."

            : "Session not created."
        );

        return;
      }

      /* ==========================================
         ONBOARDING PREMIUM
      ========================================== */

      if (
        plano &&
        periodo
      ) {

        window.location.href =
          `/checkout?plano=${plano}&periodo=${periodo}`;

        return;
      }

      /* ==========================================
         DEFAULT
      ========================================== */

      window.location.href =
        next;

    } catch (
      err
    ) {

      console.error(
        err
      );

      setErrorMsg(

        lang === "pt"

          ? "Erro inesperado no login."

          : lang === "es"

          ? "Error inesperado."

          : "Unexpected login error."
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

      {/* =====================================
          CONTEXTO COGNITIVO
      ===================================== */}

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

                : lang === "es"

                ? "Continuidad de Suscripción"

                : "Subscription Continuity"
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

      {/* =====================================
          FORM
      ===================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          space-y-4
        "
      >

        <input
          type="email"
          placeholder={

            lang === "pt"

              ? "Seu email"

              : lang === "es"

              ? "Tu email"

              : "Your email"
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
          placeholder={

            lang === "pt"

              ? "Sua senha"

              : lang === "es"

              ? "Tu contraseña"

              : "Your password"
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

        {/* =====================================
            ERROR
        ===================================== */}

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

        {/* =====================================
            BUTTON
        ===================================== */}

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
            disabled:opacity-70
          "
        >

          {loading

            ? (

              lang === "pt"

                ? "Processando..."

                : lang === "es"

                ? "Procesando..."

                : "Processing..."
            )

            : (

              lang === "pt"

                ? "Entrar"

                : lang === "es"

                ? "Ingresar"

                : "Sign In"
            )}

        </button>

      </form>

      {/* =====================================
          SWITCHER
      ===================================== */}

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

            setLangClient(
              "pt"
            );
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

            setLangClient(
              "es"
            );
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

        <button
          type="button"
          onClick={() => {

            setLang("en");

            setLangClient(
              "en"
            );
          }}
          className={`
            transition-all

            ${
              lang === "en"

                ? "font-black text-green-700"

                : "text-neutral-500"
            }
          `}
        >
          🇺🇸 EN
        </button>

      </div>

    </div>
  );
}