"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  label: string;
  href: string;
  icon: string;
};

export default function Sidebar() {
  const pathname = usePathname();

  const items: Item[] = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Financeiro", href: "/dashboard/financeiro", icon: "💰" },
    { label: "Rebanho", href: "/dashboard/rebanho", icon: "🐄" },
    { label: "Pastagem", href: "/dashboard/pastagem", icon: "🌱" },
    { label: "CFO", href: "/dashboard/cfo", icon: "📊" },
    { label: "Engorda", href: "/dashboard/engorda", icon: "⚡" },
    { label: "Assinatura", href: "/dashboard/assinatura/plano", icon: "🔒" },
  ];

  return (
    <aside className="w-72 min-h-screen bg-green-700 text-white flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-8 border-b border-green-600/40">
        <h2 className="text-2xl font-bold tracking-tight">
          PecuariaTech
        </h2>
        <p className="text-xs text-green-200 mt-1">
          Plataforma de Gestão Rural
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-6 space-y-1">

        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3
                px-4 py-2.5 rounded-md
                text-[14px] font-medium
                transition-all
                ${
                  active
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-green-100 hover:bg-green-600/70 hover:text-white"
                }
              `}
            >
              {/* Ícone */}
              <span
                className={`
                  w-5 text-center text-sm
                  ${active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}
                `}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span className="flex-1">
                {item.label}
              </span>

              {/* Indicador lateral ativo */}
              {active && (
                <span className="w-1 h-4 rounded-full bg-green-500" />
              )}
            </Link>
          );
        })}

      </nav>

      {/* RODAPÉ */}
      <div className="px-6 py-4 border-t border-green-600/40">
        <div className="text-xs text-green-200">
          Status do sistema
        </div>
        <div className="text-sm font-medium text-white">
          Estável
        </div>
      </div>

    </aside>
  );
}
