"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

export default function RegisterClient() {
  const router = useRouter();

  const [pais, setPais] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =====================================================
     REGISTER ? EQUA??O Y + REGRA Z
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

      const nome = form.get("nome") as string;
      const email = form.get("email") as string;
      const senha = form.get("senha") as string;

      /* ==========================================
         SIGNUP
      ========================================== */

      const {
        data: signUpData,
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      /* ==========================================
         DADOS LOCAIS DO ONBOARDING
      ========================================== */

      localStorage.setItem("pecuaria_nome", nome);
      localStorage.setItem("pecuaria_pais", pais);
      localStorage.setItem(
        "pecuaria_tipo_documento",
        tipoDocumento
      );

      const plano =
        localStorage.getItem("checkout_plano");

      const periodo =
        localStorage.getItem("checkout_periodo");

      const locale =
        localStorage.getItem("checkout_locale") || "pt";

      /* ==========================================
         CONTINUIDADE COMERCIAL
         PLANO ? CADASTRO ? CHECKOUT
      ========================================== */

      if (plano && periodo) {
        /*
         * O Checkout Runtime exige sess?o SSR.
         * signUp() cria a conta no Supabase, mas essa
         * sess?o do browser n?o necessariamente cria o
         * cookie SSR utilizado pela API de checkout.
         *
         * Portanto, estabelecemos a sess?o SSR por meio
         * da rota can?nica de autentica??o, sem exibir
         * uma segunda tela de login ao usu?rio.
         */

        let sessaoBrowser =
          signUpData?.session;

        if (!sessaoBrowser) {
          const {
            data: loginData,
            error: loginError,
          } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
          });

          if (loginError || !loginData?.session) {
            setError(
              loginError?.message ||
                "Conta criada, mas n?o foi poss?vel preparar a sess?o do checkout."
            );
            setLoading(false);
            return;
          }

          sessaoBrowser = loginData.session;
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
              email,
              password: senha,
            }),
          }
        );

        if (!loginResponse.ok) {
          const loginBody =
            await loginResponse
              .json()
              .catch(() => null);

          setError(
            loginBody?.error ||
              "Conta criada, mas n?o foi poss?vel preparar a sess?o segura do checkout."
          );

          setLoading(false);
          return;
        }

        /*
         * A sess?o SSR agora est? estabelecida.
         * O checkout poder? consultar getUser() pelo cookie.
         */
        router.push(
          `/${locale}/checkout?plano=${encodeURIComponent(
            plano
          )}&periodo=${encodeURIComponent(
            periodo
          )}`
        );

        return;
      }

      /* ==========================================
         FLUXO PADR?O SEM PLANO
      ========================================== */

      router.push("/login?confirm=true");
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
          intelig?ncia financeira
          e governan?a pecu?ria
          em uma ?nica plataforma.
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
            setPais(e.target.value)
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
            Selecione o Pa?s
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
            M?xico
          </option>

          <option value="CO">
            Col?mbia
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
            Fun??o (opcional)
          </option>

          <option value="proprietario">
            Propriet?rio
          </option>

          <option value="gerente">
            Gerente
          </option>

          <option value="consultor">
            Consultor
          </option>

          <option value="veterinario">
            Veterin?rio
          </option>
        </select>

        <select
          required
          value={tipoDocumento}
          onChange={(e) =>
            setTipoDocumento(e.target.value)
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
