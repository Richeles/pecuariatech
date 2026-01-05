"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaHorse,
  FaMapMarkedAlt,
  FaClipboardList,
} from "react-icons/fa";

// ===============================
// MENU PRINCIPAL DO DASHBOARD
// ===============================
const menu = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: FaChartLine,
  },
  {
    href: "/dashboard/financeiro",
    label: "Financeiro",
    icon: FaMoneyBillWave,
  },
  {
    href: "/dashboard/rebanho",
    label: "Rebanho",
    icon: FaHorse,
  },
  {
    href: "/dashboard/pastagem",
    label: "Pastagem",
    icon: FaMapMarkedAlt,
  },
  {
    href: "/planos",
    label: "Planos",
    icon: FaClipboardList,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-green-900 text-white p-6 flex flex-col">
      {/* LOGO / TÍTULO */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold tracking-wide">
          PecuariaTech
        </h2>
        <p className="text-xs text-green-200 mt-1">
          Gestão Pecuária Inteligente
        </p>
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 space-y-2">
        {menu.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  active
                    ? "bg-green-700 shadow-md"
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

      {/* CTA ASSINATURA */}
      <div className="mt-8">
        <Link
          href="/checkout"
          className="
            block text-center bg-green-600 py-3 rounded-xl
            font-semibold tracking-wide
            hover:bg-green-500 transition
          "
        >
          Assinar
        </Link>
      </div>
    </aside>
  );
}
