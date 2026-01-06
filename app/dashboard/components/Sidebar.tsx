"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaMapMarkedAlt,
  FaClipboardList,
} from "react-icons/fa";
import { GiCow } from "react-icons/gi";

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: FaChartLine },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: FaMoneyBillWave },
  { href: "/dashboard/rebanho", label: "Rebanho", icon: GiCow }, // 🐂 BOI CORRETO
  { href: "/dashboard/pastagem", label: "Pastagem", icon: FaMapMarkedAlt },
  { href: "/planos", label: "Planos", icon: FaClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-green-900 text-white px-6 py-8 flex flex-col">
      {/* LOGO */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          PecuariaTech
        </h1>
        <p className="text-sm text-green-200">
          Gestão Pecuária Inteligente
        </p>
      </div>

      {/* MENU À ESQUERDA */}
      <nav className="flex-1 space-y-1">
        {menu.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${
                  active
                    ? "bg-green-700"
                    : "hover:bg-green-800"
                }
              `}
            >
              <item.icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA FIXO EMBAIXO */}
      <Link
        href="/checkout"
        className="mt-6 text-center bg-green-600 py-3 rounded-lg font-semibold hover:bg-green-500 transition"
      >
        Assinar
      </Link>
    </aside>
  );
}
