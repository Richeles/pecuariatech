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
  { href: "/dashboard/rebanho", label: "Rebanho", icon: GiCow },
  { href: "/dashboard/pastagem", label: "Pastagem", icon: FaMapMarkedAlt },
  { href: "/planos", label: "Planos", icon: FaClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col px-5 py-6">
      {/* LOGO */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          PecuariaTech
        </h1>
        <p className="text-sm text-emerald-200">
          Gestão Pecuária Inteligente
        </p>
      </div>

      {/* MENU */}
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
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-100 hover:bg-emerald-800"
                }
              `}
            >
              <item.icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA */}
      <Link
        href="/checkout"
        className="mt-6 text-center bg-emerald-600 py-3 rounded-lg font-semibold hover:bg-emerald-500 transition"
      >
        Assinar
      </Link>
    </div>
  );
}
