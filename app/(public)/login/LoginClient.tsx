"use client";

// =========================================================
// PecuariaTech
// Login Client Premium
// Runtime Cognitivo
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
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const supabase =
        createBrowserClient();

      const {
        error,
      } =
        await supabase.auth
          .signInWithPassword({

            email,
            password,
          });

      if (error) {

        setError(
          error.message
        );

        return;
      }

      router.push(
        "/dashboard"
      );

      router.refresh();

    } catch {

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

    <form
      onSubmit={handleLogin}
      className="
        space-y-5
      "
    >

      <div>

        <label
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-neutral-700
          "
        >
          Email
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
          placeholder="seu@email.com"
          required
        />

      </div>

      <div>

        <label
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-neutral-700
          "
        >
          Senha
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
            focus:border-green-600
          "
          placeholder="••••••••"
          required
        />

      </div>

      {error && (

        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded-2xl
          bg-green-700
          px-4
          py-3
          font-black
          text-white
          transition
          hover:bg-green-800
          disabled:opacity-50
        "
      >

        {loading
          ? "Entrando..."
          : "Entrar"}

      </button>

    </form>
  );
}