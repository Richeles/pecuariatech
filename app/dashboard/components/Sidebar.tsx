"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    labelPT: "Dashboard",
    labelES: "Panel",
    href: "",
    icon: "🏠",
  },
  {
    labelPT: "Financeiro",
    labelES: "Finanzas",
    href: "/financeiro",
    icon: "💰",
  },
  {
    labelPT: "Rebanho",
    labelES: "Ganado",
    href: "/rebanho",
    icon: "🐄",
  },
  {
    labelPT: "Pastagem",
    labelES: "Pastura",
    href: "/pastagem",
    icon: "🌱",
  },
  {
    labelPT: "CFO Inteligente",
    labelES: "CFO Inteligente",
    href: "/cfo",
    icon: "🧠",
  },
  {
    labelPT: "Engorda",
    labelES: "Engorde",
    href: "/engorda",
    icon: "⚡",
  },
  {
    labelPT: "Planos",
    labelES: "Planes",
    href: "/assinatura/plano",
    icon: "🔒",
  },
];

export default function Sidebar({
  lang = "pt",
}: {
  lang?: "pt" | "es";
}) {
  const pathname = usePathname();

  return (
    <aside
      className="
        hidden lg:flex
        w-[250px]
        flex-col
        border-r border-[#406454]
        bg-gradient-to-b
        from-[#0b2418]
        via-[#123524]
        to-[#0d2b1d]
        text-white
      "
    >
      {/* LOGO */}
      <div className="border-b border-[#355845] p-6">

        <h1 className="text-[24px] font-black tracking-tight text-white">
          PecuariaTech
        </h1>

        <p className="mt-1 text-sm text-green-100/70">
          Sistema Operacional Rural
        </p>

      </div>

      {/* STATUS */}
      <div className="p-4">

        <div
          className="
            rounded-2xl
            border border-[#4d7c63]
            bg-[#214734]
            p-4
            shadow-lg
          "
        >
          <div className="flex items-center gap-2">

            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-sm font-medium text-green-100">
              IA operacional ativa
            </span>

          </div>

          <p className="mt-3 text-sm leading-relaxed text-green-100/70">
            Plataforma analítica estabilizada
          </p>

        </div>

      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6">

        <div className="space-y-2">

          {items.map((item) => {

            const fullHref =
              `/${lang}/dashboard${item.href}`;

            const active =
              pathname === fullHref;

            return (
              <Link
                key={item.href}
                href={fullHref}
                prefetch={false}
                className={`
                  flex items-center gap-4
                  rounded-2xl
                  px-4 py-3
                  transition-all duration-200
                  border border-transparent
                  ${
                    active
                      ? `
                        bg-[#6bbd88]
                        text-white
                        shadow-xl
                        border-[#95d5ab]
                      `
                      : `
                        text-green-100/85
                        hover:bg-[#2f5f47]
                        hover:border-[#4d7c63]
                      `
                  }
                `}
              >
                <span className="text-lg">
                  {item.icon}
                </span>

                <span className="font-medium">
                  {lang === "es"
                    ? item.labelES
                    : item.labelPT}
                </span>

              </Link>
            );
          })}

        </div>

      </nav>

    </aside>
  );
}