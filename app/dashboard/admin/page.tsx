// app/dashboard/admin/page.tsx
// PecuariaTech — Master Admin Runtime
// Equação Y + Regra Z
// Sem fetch interno
// Sem localhost
// Sem loop SSR

import {
  getAdminSession,
} from "@/app/services/admin/getAdminSession";

export const dynamic =
  "force-dynamic";

export default async function AdminPage() {

  /* =====================================================
     ADMIN SESSION
  ===================================================== */

  const admin =
    await getAdminSession();

  /* =====================================================
     GATE
  ===================================================== */

  if (!admin.is_admin) {

    return (
      <main
        className="
          mx-auto
          max-w-4xl
          p-10
        "
      >

        <div
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
            Acesso restrito
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-relaxed
              text-red-600
            "
          >
            Esta área exige
            credenciais administrativas
            válidas.
          </p>

        </div>

      </main>
    );
  }

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
              gap-6
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
                ⚙ Runtime Master
              </div>

              <h1
                className="
                  mt-5
                  text-4xl
                  font-black
                  tracking-tight
                "
              >
                Painel Master
              </h1>

              <p
                className="
                  mt-3
                  max-w-3xl
                  text-sm
                  leading-relaxed
                  text-green-100/80
                "
              >
                Governança central do
                runtime operacional
                PecuariaTech.
              </p>

            </div>

            <div
              className="
                rounded-3xl
                border border-white/10
                bg-white/10
                p-6
                backdrop-blur-xl
              "
            >

              <div
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-green-100/70
                "
              >
                Role
              </div>

              <div
                className="
                  mt-2
                  text-2xl
                  font-black
                "
              >
                {admin.role}
              </div>

              <div
                className="
                  mt-3
                  text-sm
                  text-green-100/70
                "
              >
                {admin.email}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          GRID
      ===================================================== */}

      <section
        className="
          grid gap-6
          lg:grid-cols-3
        "
      >

        <Card
          title="Governança SaaS"
          desc="
            Controle de planos,
            permissões,
            gates,
            middleware
            e runtime.
          "
        />

        <Card
          title="Cupons & Promoções"
          desc="
            Gestão estrutural
            de campanhas,
            upgrades
            e expansão.
          "
        />

        <Card
          title="Auditoria Operacional"
          desc="
            Supervisão cognitiva,
            eventos críticos,
            runtime
            e inteligência.
          "
        />

      </section>

      {/* =====================================================
          FUTURE
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
              Runtime Expansion
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-[#557564]
              "
            >
              Próxima evolução:
              orquestração multiagente,
              analytics Python,
              eventos
              e automações.
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
            CFO Ultra Active
          </div>

        </div>

      </section>

    </main>
  );
}

/* =====================================================
   CARD
===================================================== */

function Card({
  title,
  desc,
}: {
  title: string;

  desc: string;
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
          text-lg
          font-black
          text-[#173222]
        "
      >
        {title}
      </div>

      <p
        className="
          mt-4
          text-sm
          leading-relaxed
          text-[#557564]
        "
      >
        {desc}
      </p>

    </div>
  );
}