// app/dashboard/engorda/nutricao/page.tsx
// PecuariaTech — Nutrição Runtime ULTRA
// Fase 2 — Runtime Cognitivo Nutricional
// Equação Y + Equação Z + Triângulo 360
// SSR Seguro | Sem localhost | Sem loop interno
// Engine Ready | Python Ready

import { cookies } from "next/headers";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

/* =====================================================
   TYPES
===================================================== */

type NutricaoItem = {
  id: string;

  nome: string;

  tipo: string;

  custo_dia?: number;
};

type NutricaoAplicacao = {
  id: string;

  item_nome: string;

  animal_id?: string;

  piquete_id?: string;

  data_inicio?: string;

  data_fim?: string;
};

type NutricaoResumo = {
  total: number;
};

/* =====================================================
   HELPERS
===================================================== */

function brl(v: number) {

  return v.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function formatDate(
  value?: string
) {

  if (!value) {
    return "—";
  }

  try {

    return new Date(
      value
    ).toLocaleDateString(
      "pt-BR"
    );

  } catch {

    return "—";

  }
}

function riscoNutricional(
  custo: number,
  itens: number
) {

  if (
    custo > 5000
  ) {
    return {
      nivel:
        "alto",

      cor:
        "text-red-600",

      bg:
        "bg-red-50",

      texto:
        "Pressão nutricional elevada detectada.",
    };
  }

  if (
    custo > 2000
  ) {

    return {
      nivel:
        "moderado",

      cor:
        "text-yellow-700",

      bg:
        "bg-yellow-50",

      texto:
        "Estrutura nutricional em atenção.",
    };
  }

  if (
    itens <= 1
  ) {

    return {
      nivel:
        "baixo",

      cor:
        "text-blue-700",

      bg:
        "bg-blue-50",

      texto:
        "Baixa diversidade nutricional detectada.",
    };
  }

  return {

    nivel:
      "estável",

    cor:
      "text-green-700",

    bg:
      "bg-green-50",

    texto:
      "Estrutura nutricional estável.",
  };
}

/* =====================================================
   AUTH
===================================================== */

async function getToken() {

  const store =
    await cookies();

  return (
    store.get(
      "sb-access-token"
    )?.value ||

    store.get(
      "supabase-access-token"
    )?.value ||

    ""
  );
}

/* =====================================================
   FETCH API
===================================================== */

async function fetchRuntime<T>(
  path: string
): Promise<T> {

  const token =
    await getToken();

  const origin =
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    "https://www.pecuariatech.com";

  const response =
    await fetch(
      `${origin}${path}`,
      {
        method: "GET",

        cache: "no-store",

        headers: token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {},
      }
    );

  if (
    !response.ok
  ) {

    let err: any =
      {};

    try {

      err =
        await response.json();

    } catch {}

    throw new Error(
      err?.error ||
        `runtime_error_${response.status}`
    );
  }

  return response.json();
}

/* =====================================================
   PAGE
===================================================== */

export default async function NutricaoDashboard() {

  let itens:
    NutricaoItem[] = [];

  let aplicacoes:
    NutricaoAplicacao[] = [];

  let custoDia:
    NutricaoResumo = {
      total: 0,
    };

  try {

    [
      itens,
      aplicacoes,
      custoDia,
    ] = await Promise.all([

      fetchRuntime<
        NutricaoItem[]
      >(
        "/api/nutricao/itens"
      ),

      fetchRuntime<
        NutricaoAplicacao[]
      >(
        "/api/nutricao/aplicacoes"
      ),

      fetchRuntime<
        NutricaoResumo
      >(
        "/api/nutricao/custo-dia"
      ),
    ]);

  } catch (e: any) {

    return (

      <main
        className="
          mx-auto
          max-w-7xl
          space-y-6
          px-8
          py-10
        "
      >

        <section
          className="
            rounded-3xl
            border border-red-200
            bg-red-50
            p-8
          "
        >

          <h1
            className="
              text-2xl
              font-black
              text-red-700
            "
          >
            Runtime Nutricional indisponível
          </h1>

          <p
            className="
              mt-4
              text-sm
              text-red-600
            "
          >
            {
              e?.message ||
              "Falha operacional"
            }
          </p>

          <div
            className="
              mt-6
              rounded-2xl
              bg-white/70
              p-5
              text-xs
              leading-relaxed
              text-red-700
            "
          >
            O runtime nutricional
            exige autenticação
            válida e APIs
            operacionais online.
          </div>

        </section>

      </main>
    );
  }

  /* =====================================================
     KPIS
  ===================================================== */

  const totalItens =
    itens.length;

  const totalAplicacoes =
    aplicacoes.length;

  const totalCustoDia =
    Number(
      custoDia?.total || 0
    );

  const risco =
    riscoNutricional(
      totalCustoDia,
      totalItens
    );

  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <main
      className="
        mx-auto
        max-w-7xl
        space-y-8
        px-8
        py-10
      "
    >

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-3xl
          border border-[#dbe7de]
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            bg-gradient-to-r
            from-[#173222]
            via-[#204631]
            to-[#28553b]
            px-10
            py-10
            text-white
          "
        >

          <div
            className="
              flex flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border border-white/20
                  bg-white/10
                  px-4 py-2
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                "
              >
                🧠 Nutrição Runtime ULTRA
              </div>

              <h1
                className="
                  mt-5
                  text-4xl
                  font-black
                  tracking-tight
                "
              >
                Nutrição Estratégica
              </h1>

              <p
                className="
                  mt-4
                  max-w-3xl
                  text-sm
                  leading-relaxed
                  text-green-100/80
                "
              >
                Monitoramento nutricional,
                impacto econômico,
                eficiência operacional
                e suporte ao runtime
                Engorda ULTRA.
              </p>

            </div>

            <div
              className={`
                rounded-3xl
                border border-white/10
                p-6
                backdrop-blur-xl
                ${risco.bg}
              `}
            >

              <div
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-black/60
                "
              >
                Risco Nutricional
              </div>

              <div
                className={`
                  mt-2
                  text-3xl
                  font-black
                  ${risco.cor}
                `}
              >
                {risco.nivel}
              </div>

              <div
                className="
                  mt-3
                  text-sm
                  text-black/70
                "
              >
                {risco.texto}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          KPIs
      ===================================================== */}

      <section
        className="
          grid gap-6
          md:grid-cols-3
        "
      >

        <KpiCard
          title="
            Itens Nutricionais
          "
          value={
            totalItens
          }
          insight="
            Estrutura nutricional
            cadastrada no runtime.
          "
        />

        <KpiCard
          title="
            Aplicações Ativas
          "
          value={
            totalAplicacoes
          }
          insight="
            Programas nutricionais
            em execução.
          "
        />

        <KpiCard
          title="
            Custo Diário
          "
          value={brl(
            totalCustoDia
          )}
          insight="
            Impacto econômico
            nutricional diário.
          "
        />

      </section>

      {/* =====================================================
          ITENS
      ===================================================== */}

      <section
        className="
          rounded-3xl
          border border-[#dbe7de]
          bg-white
          p-8
          shadow-sm
        "
      >

        <div
          className="
            flex items-center
            justify-between
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-black
                text-[#173222]
              "
            >
              Catálogo Nutricional
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-[#557564]
              "
            >
              Estrutura alimentar
              operacional ativa.
            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-[#173222]
              px-5 py-3
              text-sm
              font-bold
              text-white
            "
          >
            Engine Ready
          </div>

        </div>

        <div
          className="
            mt-8
            overflow-auto
          "
        >

          <table
            className="
              w-full
              text-sm
            "
          >

            <thead>

              <tr
                className="
                  border-b
                "
              >

                <th
                  className="
                    py-3
                    text-left
                  "
                >
                  Nome
                </th>

                <th
                  className="
                    py-3
                    text-left
                  "
                >
                  Tipo
                </th>

                <th
                  className="
                    py-3
                    text-right
                  "
                >
                  Custo/dia
                </th>

              </tr>

            </thead>

            <tbody>

              {itens.map(
                (i) => (

                <tr
                  key={i.id}
                  className="
                    border-b
                    last:border-0
                  "
                >

                  <td
                    className="
                      py-3
                    "
                  >
                    {i.nome}
                  </td>

                  <td
                    className="
                      py-3
                      capitalize
                    "
                  >
                    {i.tipo}
                  </td>

                  <td
                    className="
                      py-3
                      text-right
                      font-semibold
                    "
                  >
                    {brl(
                      Number(
                        i.custo_dia || 0
                      )
                    )}
                  </td>

                </tr>

              ))}

              {!itens.length && (

                <tr>

                  <td
                    colSpan={3}
                    className="
                      py-5
                      text-center
                      text-gray-500
                    "
                  >
                    Nenhum item encontrado.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          APLICAÇÕES
      ===================================================== */}

      <section
        className="
          rounded-3xl
          border border-[#dbe7de]
          bg-white
          p-8
          shadow-sm
        "
      >

        <h2
          className="
            text-xl
            font-black
            text-[#173222]
          "
        >
          Aplicações Ativas
        </h2>

        <div
          className="
            mt-8
            overflow-auto
          "
        >

          <table
            className="
              w-full
              text-sm
            "
          >

            <thead>

              <tr
                className="
                  border-b
                "
              >

                <th className="py-3 text-left">
                  Item
                </th>

                <th className="py-3 text-left">
                  Alvo
                </th>

                <th className="py-3 text-left">
                  Início
                </th>

                <th className="py-3 text-left">
                  Fim
                </th>

              </tr>

            </thead>

            <tbody>

              {aplicacoes.map(
                (a) => (

                <tr
                  key={a.id}
                  className="
                    border-b
                    last:border-0
                  "
                >

                  <td className="py-3">
                    {a.item_nome}
                  </td>

                  <td className="py-3">
                    {a.animal_id
                      ? "Animal"
                      : "Piquete"}
                  </td>

                  <td className="py-3">
                    {formatDate(
                      a.data_inicio
                    )}
                  </td>

                  <td className="py-3">
                    {a.data_fim
                      ? formatDate(
                          a.data_fim
                        )
                      : "Em andamento"}
                  </td>

                </tr>

              ))}

              {!aplicacoes.length && (

                <tr>

                  <td
                    colSpan={4}
                    className="
                      py-5
                      text-center
                      text-gray-500
                    "
                  >
                    Nenhuma aplicação ativa.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          DISCLAIMER
      ===================================================== */}

      <footer
        className="
          rounded-3xl
          border border-[#dbe7de]
          bg-white
          p-6
          text-xs
          leading-relaxed
          text-[#557564]
          shadow-sm
        "
      >
        O PecuariaTech entrega
        gestão operacional,
        inteligência econômica
        e inferência estratégica.
        Não substitui prescrição
        veterinária ou zootécnica.
      </footer>

    </main>
  );
}

/* =====================================================
   KPI CARD
===================================================== */

function KpiCard({
  title,
  value,
  insight,
}: {
  title: string;

  value:
    | string
    | number;

  insight: string;
}) {

  return (

    <div
      className="
        rounded-3xl
        border border-[#dbe7de]
        bg-white
        p-7
        shadow-sm
      "
    >

      <div
        className="
          text-sm
          text-[#557564]
        "
      >
        {title}
      </div>

      <div
        className="
          mt-4
          text-3xl
          font-black
          text-[#173222]
        "
      >
        {value}
      </div>

      <p
        className="
          mt-4
          text-sm
          leading-relaxed
          text-[#557564]
        "
      >
        {insight}
      </p>

    </div>
  );
}