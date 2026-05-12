"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

export default function RegisterClient() {

  const router = useRouter();

  const [pais, setPais] =
    useState("");

  const [tipoDocumento, setTipoDocumento] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =====================================================
     REGISTER — EQUAÇÃO Y + REGRA Z
  ===================================================== */

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    if (loading) return;

    setLoading(true);

    setError(null);

    try {

      const form =
        new FormData(
          e.currentTarget
        );

      const nome =
        form.get("nome") as string;

      const email =
        form.get("email") as string;

      const senha =
        form.get("senha") as string;

      /* ==========================================
         SIGNUP LIMPO
         (ISOLANDO ERRO SUPABASE/TRIGGER)
      ========================================== */

      const {
        error,
      } =
        await supabase.auth.signUp({

          email,

          password: senha,
        });

      /* ==========================================
         ERROR
      ========================================== */

      if (error) {

        setError(
          error.message
        );

        setLoading(false);

        return;
      }

      /* ==========================================
         SALVA DADOS LOCALMENTE
      ========================================== */

      localStorage.setItem(
        "pecuaria_nome",
        nome
      );

      localStorage.setItem(
        "pecuaria_pais",
        pais
      );

      localStorage.setItem(
        "pecuaria_tipo_documento",
        tipoDocumento
      );

      /* ==========================================
         ONBOARDING PREMIUM
      ========================================== */

      const plano =
        localStorage.getItem(
          "checkout_plano"
        );

      const periodo =
        localStorage.getItem(
          "checkout_periodo"
        );

      /* ==========================================
         CONTINUIDADE COGNITIVA
      ========================================== */

      if (
        plano &&
        periodo
      ) {

        router.push(
          `/login?next=/checkout?plano=${plano}&periodo=${periodo}`
        );

        return;
      }

      /* ==========================================
         DEFAULT
      ========================================== */

      router.push(
        "/login?confirm=true"
      );

    } catch (err) {

      console.error(err);

      setError(
        "Erro interno ao criar conta. Tente novamente."
      );

    } finally {

      setLoading(false);
    }
  }

  /* =====================================================
     UI PREMIUM
  ===================================================== */

  return (

    <div
      className="
        w-full
        max-w-xl
        rounded-3xl
        border
        border-emerald-200
        bg-emerald-50/95
        p-10
        shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)]
        backdrop-blur-xl
      "
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <div
        className="
          mb-8
          text-center
        "
      >

        <div
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-emerald-300
            bg-white/70
            px-4
            py-2
            text-[11px]
            font-black
            uppercase
            tracking-widest
            text-emerald-700
            shadow-sm
          "
        >
          PecuariaTech Governance Layer
        </div>

        <h1
          className="
            mt-5
            text-3xl
            font-black
            tracking-tight
            text-emerald-900
          "
        >
          Cadastro PecuariaTech
        </h1>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-emerald-800/80
          "
        >
          Infraestrutura operacional,
          inteligência financeira
          e governança pecuária
          em uma única plataforma.
        </p>

      </div>

      {/* =====================================
          FORM
      ===================================== */}

      <form
        onSubmit={handleRegister}
        className="space-y-5"
      >

        <input
          name="nome"
          required
          placeholder="Nome completo"
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        />

        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        />

        <input
          name="senha"
          type="password"
          required
          placeholder="Senha"
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        />

        <select
          required
          value={pais}
          onChange={(e) =>
            setPais(
              e.target.value
            )
          }
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        >

          <option value="">
            Selecione o País
          </option>

          <option value="BR">
            Brasil
          </option>

          <option value="US">
            Estados Unidos
          </option>

          <option value="AR">
            Argentina
          </option>

          <option value="MX">
            México
          </option>

          <option value="CO">
            Colômbia
          </option>

          <option value="UY">
            Uruguai
          </option>

          <option value="CL">
            Chile
          </option>

          <option value="PY">
            Paraguai
          </option>

        </select>

        <select
          name="sistema_produtivo"
          required
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        >

          <option value="">
            Sistema Produtivo
          </option>

          <option value="corte">
            Corte
          </option>

          <option value="leite">
            Leite
          </option>

          <option value="misto">
            Misto
          </option>

        </select>

        <select
          name="funcao"
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        >

          <option value="">
            Função (opcional)
          </option>

          <option value="proprietario">
            Proprietário
          </option>

          <option value="gerente">
            Gerente
          </option>

          <option value="consultor">
            Consultor
          </option>

          <option value="veterinario">
            Veterinário
          </option>

        </select>

        <select
          required
          value={tipoDocumento}
          onChange={(e) =>
            setTipoDocumento(
              e.target.value
            )
          }
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        >

          <option value="">
            Tipo de Documento
          </option>

          <option value="cpf">
            CPF
          </option>

          <option value="cnpj">
            CNPJ
          </option>

        </select>

        <input
          name="documento"
          required
          placeholder="Digite o CPF ou CNPJ"
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        />

        <input
          name="telefone"
          placeholder="Telefone (com DDI)"
          className="
            w-full
            rounded-xl
            border
            border-emerald-200
            bg-white
            p-3
            outline-none
            transition
            focus:border-emerald-500
            focus:ring-2
            focus:ring-emerald-400/40
          "
        />

        {error && (

          <div
            className="
              text-center
              text-sm
              text-red-600
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
            rounded-xl
            bg-gradient-to-r
            from-emerald-600
            to-green-700
            py-3
            font-semibold
            text-white
            shadow-lg
            transition
            hover:scale-[1.02]
            hover:shadow-2xl
            disabled:opacity-60
          "
        >

          {loading
            ? "Criando conta..."
            : "Criar Conta"}

        </button>

      </form>

    </div>
  );
}