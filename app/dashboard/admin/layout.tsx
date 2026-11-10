import Link from "next/link";
import type { ReactNode } from "react";
import { getAdminSession } from "@/app/services/admin/getAdminSession";

export const dynamic = "force-dynamic";

const links = [
  { href: "/dashboard/admin", label: "Painel Master" },
  { href: "/dashboard/admin/usuarios", label: "Usuários" },
  { href: "/dashboard/admin/assinaturas", label: "Assinaturas" },
  { href: "/dashboard/admin/planos", label: "Planos" },
  { href: "/dashboard/admin/promocoes", label: "Promoções" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getAdminSession();

  if (!admin.is_admin) {
    return (
      <main className="min-h-screen bg-[#f5f8f5] p-8">
        <section className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8">
          <h1 className="text-2xl font-black text-red-700">
            Acesso restrito
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Esta área exige autorização administrativa Master válida.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8f5] md:flex-row">
      <aside className="w-full shrink-0 bg-[#173222] p-6 text-white md:w-64">
        <div className="mb-8 border-b border-white/15 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-300">
            PecuariaTech
          </p>
          <h1 className="mt-2 text-2xl font-black">Admin Master</h1>
          <p className="mt-2 break-all text-xs text-green-100/70">
            {admin.email ?? "Administrador autenticado"}
          </p>
        </div>

        <nav className="space-y-2" aria-label="Navegação administrativa">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-green-50 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 border-t border-white/15 pt-5">
          <Link
            href="/"
            className="text-xs font-semibold text-green-200 hover:text-white"
          >
            Voltar ao site
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
