"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const items = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Financeiro", href: "/dashboard/financeiro" },
    { label: "Rebanho", href: "/dashboard/rebanho" },
    { label: "Pastagem", href: "/dashboard/pastagem" },
    { label: "CFO", href: "/dashboard/cfo" },
    { label: "Engorda", href: "/dashboard/engorda" },
    { label: "Assinatura", href: "/dashboard/assinatura/plano" },
  ];

  return (
    <aside className="w-72 min-h-screen bg-green-700 text-white px-6 py-8 flex flex-col">

      {/* LOGO */}
      <div className="mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight">
          PecuariaTech
        </h2>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-3">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-5 py-3 rounded-lg
                text-sm font-semibold
                transition-all duration-200
                ${
                  active
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-white/90 hover:bg-green-600 hover:text-white"
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
