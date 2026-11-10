// =========================================================
// PECUARIATECH — MASTER ADMIN RUNTIME
// Next.js 16
//
// ESR + MPVEC SIMBIÓTICO
//
// X  = Interface administrativa
// Y  = Supabase / Verdade dos dados
// Z  = Identidade e autorização
// π  = Processamento operacional
// Ω  = Coerência e governança
//
// Sem fetch interno
// Sem localhost
// Sem loop SSR
// =========================================================

import {
  getAdminSession,
} from "@/app/services/admin/getAdminSession";

export const dynamic = "force-dynamic";

// =========================================================
// ADMIN PAGE
// =========================================================

export default async function AdminPage() {
  // =====================================================
  // 1. Z — VALIDAR SESSÃO ADMINISTRATIVA
  // =====================================================

  const admin = await getAdminSession();

  // =====================================================
  // 2. GATE — ACESSO RESTRITO
  // =====================================================

  if (!admin.is_admin) {
    return (
      <main className="mx-auto max-w-4xl p-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-black text-red-700">
            Acesso restrito
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-red-600">
            Esta área exige credenciais administrativas válidas.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // 3. DADOS ADMINISTRATIVOS
  // =====================================================

  const adminRole = admin.role ?? "master";
  const adminEmail = admin.email ?? "Administrador autenticado";

  // =====================================================
  // 4. INTERFACE MASTER
  // =====================================================

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-8 py-10">

      {/* =================================================
          HERO — IDENTIDADE MASTER
      ================================================= */}

      <section className="overflow-hidden rounded-3xl border border-[#dbe7de] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#173222] via-[#204631] to-[#28553b] px-10 py-10 text-white">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">
                ⚙ Runtime Master
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight">
                Painel Master
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-green-100/80">
                Governança central do runtime operacional PecuariaTech.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">

              <div className="text-xs uppercase tracking-wider text-green-100/70">
                Role
              </div>

              <div className="mt-2 text-2xl font-black">
                {adminRole}
              </div>

              <div className="mt-3 text-sm text-green-100/70">
                {adminEmail}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          GRID — GOVERNANÇA
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-3">

        <Card
          title="Governança SaaS"
          desc="Controle de planos, permissões, gates, autorização e runtime."
        />

        <Card
          title="Cupons e Promoções"
          desc="Gestão de campanhas comerciais e condições promocionais."
        />

        <Card
          title="Auditoria Operacional"
          desc="Supervisão de eventos críticos, integridade e inteligência operacional."
        />

      </section>

      {/* =================================================
          EXPANSÃO ADMINISTRATIVA
      ================================================= */}

      <section className="rounded-3xl border border-[#dbe7de] bg-white p-8 shadow-sm">

        <h2 className="text-xl font-black text-[#173222]">
          Gestão Administrativa
        </h2>

        <p className="mt-2 text-sm text-[#557564]">
          Área de controle dos registros administrativos e comerciais existentes.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <ManagementItem
            title="Usuários"
            description="Consulta dos usuários cadastrados."
            href="/dashboard/admin/usuarios"
          />

          <ManagementItem
            title="Assinaturas"
            description="Consulta das assinaturas registradas."
            href="/dashboard/admin/assinaturas"
          />

                    <ManagementItem
            title="Promoções comerciais"
            description="Configuração de campanhas, descontos, planos elegíveis e períodos promocionais."
            href="/dashboard/admin/promocoes"
          />
<ManagementItem
            title="Planos"
            description="Consulta do catálogo de planos."
            href="/dashboard/admin/planos"
          />

        </div>

      </section>

      {/* =================================================
          STATUS DO RUNTIME
      ================================================= */}

      <section className="rounded-3xl border border-[#dbe7de] bg-white p-8 shadow-sm">

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-xl font-black text-[#173222]">
              Runtime Expansion
            </h2>

            <p className="mt-2 text-sm text-[#557564]">
              Evolução da governança, concessões individuais,
              analytics Python, eventos e automações.
            </p>
          </div>

          <div className="rounded-2xl bg-[#173222] px-5 py-3 text-sm font-bold text-white">
            Admin Master autenticado
          </div>

        </div>

      </section>

    </main>
  );
}

// =========================================================
// CARD INFORMATIVO
// =========================================================

function Card({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-[#dbe7de] bg-white p-7 shadow-sm">

      <div className="text-lg font-black text-[#173222]">
        {title}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[#557564]">
        {desc}
      </p>

    </div>
  );
}

// =========================================================
// NAVEGAÇÃO ADMINISTRATIVA
// =========================================================

function ManagementItem({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-2xl border border-[#dbe7de] bg-[#f8fbf8] p-5 transition hover:border-[#28553b] hover:bg-[#eff7f0]"
    >
      <h3 className="font-bold text-[#173222]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-[#557564]">
        {description}
      </p>

      <span className="mt-4 inline-block text-xs font-bold text-[#28553b]">
        Acessar →
      </span>
    </a>
  );
}