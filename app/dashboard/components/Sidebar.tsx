"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Financeiro", href: "/dashboard/financeiro" },
  { label: "Rebanho", href: "/dashboard/rebanho" },
  { label: "Pastagem", href: "/dashboard/pastagem" },
  { label: "Planos", href: "/planos" },
  { label: "Assinar", href: "/planos" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-green-700 text-white flex flex-col">
      <div className="px-6 py-5 text-xl font-bold border-b border-green-600">
        PecuariaTech
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-4 py-2 transition ${
                active
                  ? "bg-green-900 font-semibold"
                  : "hover:bg-green-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
