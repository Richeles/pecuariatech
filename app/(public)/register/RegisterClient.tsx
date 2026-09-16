"use client";

import { useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pais, setPais] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     REGISTER - EQUAÇÃO Y + REGRA Z
  ===================================================== */

  async function handleRegister(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);

      const nome = String(
        form.get("nome") ?? ""
      ).trim();

      const email = String(
        form.get("email") ?? ""
      )
        .trim()
        .toLowerCase();

      const senha = String(
        form.get("senha") ?? ""
      );

      const funcao = String(
        form.get("funcao") ?? ""
      ).trim();

      if (!nome || !email || !senha) {
        setError(
          "Preencha nome, e-mail e senha."
        );
        setLoading(false);
        return;
      }

      /* ==========================================
         INTENÇÃO COMERCIAL
         Origem: Planos
         X → Cadastro
      ========================================== */

      const plano =
        searchParams.get("plano");

      const periodo =
        searchParams.get("periodo");

      const localeParam =
        searchParams.get("locale");

      const locale =
        localeParam === "es"
          ? "es"
          : "pt";

      /* ==========================================
         SIGNUP
      ========================================== */

      const {
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            pecuaria_nome: nome,
            pecuaria_pais: pais,
            pecuaria_tipo_documento:
              tipoDocumento,
            funcao,
          },
        },
      });

      if (signUpError) {
        setError(
          signUpError.message
        );
        setLoading(false);
        return;
      }

      /* ==========================================
         DADOS DE ONBOARDING
         Persistência auxiliar local
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
         PRIMEIRA COMPRA
         PLANOS → CADASTRO → SESSÃO → CHECKOUT
      ========================================== */

      if (plano && periodo) {
        const loginResponse =
          await fetch(
            "/api/auth/login",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                email,
                password: senha,
              }),
            }
          );

        const loginBody =
          await loginResponse
            .json()
            .catch(() => null);

        if (!loginResponse.ok) {
          setError(
            loginBody?.error ||
              "A conta foi criada, mas a sessão segura não pôde ser estabelecida para o checkout."
          );

          setLoading(false);
          return;
        }

        const checkoutUrl =
          `/${locale}/checkout?plano=${encodeURIComponent(
            plano
          )}&periodo=${encodeURIComponent(
            periodo
          )}`;

        router.push(checkoutUrl);
        return;
      }

      /* ==========================================
         CADASTRO SEM COMPRA
      ========================================== */

      router.push(
        `/${locale}/login?confirm=true`
      );
    } catch (err) {
      console.error(
        "[REGISTER_RUNTIME]",
        err
      );

      setError(
        "Erro interno ao criar a conta. Tente novamente."
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
          placeholder="E-mail"
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

        <div className="relative">
          <input
            name="senha"
            type={
              mostrarSenha
                ? "text"
                : "password"
            }
            required
            minLength={6}
            placeholder="Senha"
            autoComplete="new-password"
            className="
              w-full
              rounded-xl
              border
              border-emerald-200
              bg-white
              p-3
              pr-24
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-2
              focus:ring-emerald-400/40
            "
          />

          <button
            type="button"
            onClick={() =>
              setMostrarSenha(
                (valor) => !valor
              )
            }
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-xs
              font-bold
              text-emerald-700
              hover:text-emerald-900
            "
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
            Sistema produtivo
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
            Perfil na propriedade (opcional)
          </option>

          <option value="proprietario">
            Produtor / Proprietário
          </option>

          <option value="gestor">
            Gestor da Fazenda
          </option>

          <option value="tecnico">
            Técnico / Consultor
          </option>

          <option value="colaborador">
            Colaborador Operacional
          </option>

          <option value="administrativo">
            Administrativo / Financeiro
          </option>

          <option value="parceiro">
            Parceiro / Prestador
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
            Tipo de documento
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
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-3
              text-center
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
            disabled:cursor-not-allowed
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
