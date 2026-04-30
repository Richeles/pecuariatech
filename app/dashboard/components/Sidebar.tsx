"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLangFromClient, t } from "@/app/lib/i18n";

export default function Sidebar() {
  const pathname = usePathname();
  const lang = getLangFromClient();

  const items = [
    { key: "menu_dashboard", href: "/dashboard", icon: "🏠" },
    { key: "menu_financeiro", href: "/dashboard/financeiro", icon: "💰" },
    { key: "menu_rebanho", href: "/dashboard/rebanho", icon: "🐄" },
    { key: "menu_pastagem", href: "/dashboard/pastagem", icon: "🌱" },
    { key: "menu_cfo", href: "/dashboard/cfo", icon: "🧠" },
    { key: "menu_engorda", href: "/dashboard/engorda", icon: "⚡" },
    { key: "menu_assinatura", href: "/dashboard/assinatura/plano", icon: "🔒" },
  ];

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
              <span className="text-lg">{item.icon}</span>

              <span>{t(lang, item.key)}</span>

              {active && (
                <span className="ml-auto w-1.5 h-5 rounded-full bg-green-500" />
              )}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}