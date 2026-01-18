// app/dashboard/layout.tsx
// DASHBOARD HUB — Centro de Comando do PecuariaTech
// Next.js 16 | App Router | Server Component
//
// Patch mínimo blindado: Sidebar por plano (Equação Y)
// Fonte: /api/assinaturas/status-server (cookie SSR)
// Regra: Sidebar nunca quebra. Se API falhar -> fallback seguro.

import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";

type Beneficios = {
  rebanho: boolean;
  pastagem: boolean;

  engorda_base?: boolean;
  engorda_ultra?: boolean;

  financeiro?: boolean;
  cfo?: boolean;

  esg?: boolean;
  multiusuario?: boolean;
};

type StatusPlanoResp = {
  ativo: boolean;
  plano: string;
  nivel: number;
  expires_at: string | null;
  beneficios: Beneficios;
};

const BENEFICIOS_FALLBACK: Beneficios = {
  rebanho: true,
  pastagem: true,
  engorda_base: false,
  engorda_ultra: false,
  financeiro: false,
  cfo: false,
  esg: false,
  multiusuario: false,
};

async function getStatusPlanoSSR(): Promise<StatusPlanoResp> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.toString();

    // ✅ absoluto para SSR (Vercel + local)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL?.startsWith("http")
        ? process.env.VERCEL_URL
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3333";

    const res = await fetch(`${baseUrl}/api/assinaturas/status-server?ts=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      headers: { cookie },
    });

    if (!res.ok) {
      return {
        ativo: false,
        plano: "basico",
        nivel: 1,
        expires_at: null,
        beneficios: BENEFICIOS_FALLBACK,
      };
    }

    const data = (await res.json().catch(() => null)) as Partial<StatusPlanoResp> | null;

    return {
      ativo: Boolean(data?.ativo),
      plano: String(data?.plano ?? "basico"),
      nivel: Number(data?.nivel ?? 1),
      expires_at: (data?.expires_at as any) ?? null,
      beneficios: (data?.beneficios as any) ?? BENEFICIOS_FALLBACK,
    };
  } catch {
    // 🔒 fallback anti-quebra
    return {
      ativo: false,
      plano: "basico",
      nivel: 1,
      expires_at: null,
      beneficios: BENEFICIOS_FALLBACK,
    };
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Equação Y: status por plano vem de API canônica
  const status = await getStatusPlanoSSR();
  const b = status?.beneficios ?? BENEFICIOS_FALLBACK;

  // 🔒 Triângulo 360: aqui só controlamos exibição
  // Gate real continua no middleware/paywall.
  const canFinanceiro = Boolean(b.financeiro);
  const canCFO = Boolean(b.cfo);
  const canEngorda = Boolean(b.engorda_base || b.engorda_ultra);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* MENU LATERAL ESQUERDO (HUB) */}
      <aside className="w-64 bg-green-700 text-white flex flex-col">
        {/* LOGO (imagem + marca) */}
        <div className="px-6 py-5 border-b border-green-600">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded bg-white/10 overflow-hidden border border-white/20">
              <Image
                src="/pecuariatech.png"
                alt="PecuariaTech"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-wide">PecuariaTech</h1>
              <p className="text-[11px] text-white/80">Gestão inteligente no campo</p>
            </div>
          </div>

          {/* ✅ Badge plano (não quebra) */}
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-white/80">Plano</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 font-semibold">
              {String(status?.plano ?? "basico").toUpperCase()}
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
          <Link href="/dashboard" className="block rounded px-3 py-2 hover:bg-green-600">
            Visão Geral
          </Link>

          {/* Financeiro (por plano) */}
          {canFinanceiro ? (
            <Link href="/dashboard/financeiro" className="block rounded px-3 py-2 hover:bg-green-600">
              Financeiro
            </Link>
          ) : (
            <Link
              href="/planos"
              className="block rounded px-3 py-2 hover:bg-green-600/40 text-white/80"
              title="Disponível em planos superiores"
            >
              Financeiro <span className="text-[10px] opacity-80">(Upgrade)</span>
            </Link>
          )}

          {/* Rebanho */}
          <Link href="/dashboard/rebanho" className="block rounded px-3 py-2 hover:bg-green-600">
            Rebanho
          </Link>

          {/* Pastagem */}
          <Link href="/dashboard/pastagem" className="block rounded px-3 py-2 hover:bg-green-600">
            Pastagem
          </Link>

          {/* Engorda (por plano) */}
          {canEngorda ? (
            <Link href="/dashboard/engorda" className="block rounded px-3 py-2 hover:bg-green-600">
              Engorda
            </Link>
          ) : (
            <Link
              href="/planos"
              className="block rounded px-3 py-2 hover:bg-green-600/40 text-white/80"
              title="Disponível em planos superiores"
            >
              Engorda <span className="text-[10px] opacity-80">(Upgrade)</span>
            </Link>
          )}

          {/* CFO (somente premium/pelos benefícios) */}
          {canCFO ? (
            <Link href="/dashboard/cfo" className="block rounded px-3 py-2 hover:bg-green-600">
              CFO 360°
            </Link>
          ) : (
            <Link
              href="/planos"
              className="block rounded px-3 py-2 hover:bg-green-600/40 text-white/80"
              title="Disponível em Premium Dominus 360°"
            >
              CFO 360° <span className="text-[10px] opacity-80">(Premium)</span>
            </Link>
          )}

          {/* Planos */}
          <Link href="/planos" className="block rounded px-3 py-2 hover:bg-green-600">
            Planos
          </Link>

          {/* CTA */}
          <Link
            href="/planos"
            className="mt-4 block text-center bg-green-500 rounded px-3 py-2 font-semibold hover:bg-green-400"
          >
            Assinar
          </Link>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        {/* TOPO CENTRAL */}
        <header className="bg-white border-b px-8 py-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">PecuariaTech</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestão inteligente para decisões reais e crescimento sustentável
          </p>
        </header>

        {/* CONTEÚDO */}
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
