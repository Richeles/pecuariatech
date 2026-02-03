"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Financeiro", href: "/dashboard/financeiro" },
  { label: "Rebanho", href: "/dashboard/rebanho" },
  { label: "Pastagem", href: "/dashboard/pastagem" },
  { label: "CFO", href: "/dashboard/cfo" },
  { label: "Engorda", href: "/dashboard/engorda" },
  { label: "Assinatura", href: "/dashboard/assinatura/plano" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-green-800 text-white flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-6 text-2xl font-extrabold tracking-wide">
        PecuariaTech
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 space-y-2">

        {menu.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg text-lg font-medium transition
                ${active
                  ? "bg-white text-green-800"
                  : "text-white hover:bg-green-700"
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
