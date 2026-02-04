"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Financeiro", href: "/dashboard/financeiro", icon: "💰" },
  { label: "Rebanho", href: "/dashboard/rebanho", icon: "🐄" },
  { label: "Pastagem", href: "/dashboard/pastagem", icon: "🌱" },
  { label: "CFO", href: "/dashboard/cfo", icon: "🧠" },
  { label: "Engorda", href: "/dashboard/engorda", icon: "⚡" },
  { label: "Assinatura", href: "/dashboard/assinatura/plano", icon: "🔒" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 min-h-screen bg-green-700 text-white flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-8 border-b border-green-600">
        <h2 className="text-2xl font-bold tracking-tight">
          PecuariaTech
        </h2>
        <p className="text-xs text-green-200 mt-1">
          Plataforma de Gestão Rural
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-1">

        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3
                px-4 py-3 rounded-xl
                text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-green-100 hover:bg-green-600 hover:text-white"
                }
              `}
            >
              <span className="text-lg leading-none">
                {item.icon}
              </span>

              <span>{item.label}</span>

              {active && (
                <span className="ml-auto w-1.5 h-5 rounded-full bg-green-500" />
              )}
            </Link>
          );
        })}

      </nav>

      {/* FOOTER */}
      <div className="px-4 py-4 border-t border-green-600">

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-800/40">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-semibold">
            N
          </div>

          <div className="leading-tight">
            <p className="text-sm font-medium">Usuário</p>
            <p className="text-xs text-green-200">Sessão ativa</p>
          </div>
        </div>

      </div>

    </aside>
  );
}
