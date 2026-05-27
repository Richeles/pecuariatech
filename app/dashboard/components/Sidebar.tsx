"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  pecuariaTheme,
} from "@/app/lib/theme";

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

  const pathname =
    usePathname();

  return (

    <aside
      className={`
        hidden
        lg:flex
        w-[250px]
        flex-col
        border-r
        border-[#355845]
        ${pecuariaTheme.sidebar.background}
        ${pecuariaTheme.sidebar.text}
      `}
    >

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div
        className="
          border-b
          border-[#355845]
          p-6
        "
      >

        <h1
          className="
            text-[24px]
            font-black
            tracking-tight
            text-white
          "
        >
          PecuariaTech
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-[#b7d6c2]
          "
        >
          Gestão Inteligente
        </p>

      </div>

      {/* =====================================================
          STATUS
      ===================================================== */}

      <div className="p-4">

        <div
          className="
            rounded-2xl
            border
            border-[#355845]
            bg-[#173126]
            p-4
            shadow-xl
            backdrop-blur-sm
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                h-2
                w-2
                rounded-full
                bg-[#52b788]
                animate-pulse
              "
            />

            <span
              className="
                text-sm
                font-semibold
                text-[#f3fff7]
              "
            >
              IA operacional ativa
            </span>

          </div>

          <p
            className="
              mt-3
              text-sm
              leading-relaxed
              text-[#b7d6c2]
            "
          >
            Plataforma analítica estabilizada
          </p>

        </div>

      </div>

      {/* =====================================================
          MENU
      ===================================================== */}

      <nav
        className="
          flex-1
          px-4
          py-6
        "
      >

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
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  px-4
                  py-3
                  border
                  transition-all
                  duration-200

                  ${
                    active

                      ? `
                        ${pecuariaTheme.sidebar.active}
                        border-[#4f9b68]
                        shadow-xl
                        scale-[1.01]
                      `

                      : `
                        border-transparent
                        text-[#d7ffe5]
                        hover:bg-[#214734]
                        hover:border-[#4f9b68]
                        hover:text-white
                      `
                  }
                `}
              >

                {/* ICON */}

                <span
                  className="
                    text-lg
                  "
                >
                  {item.icon}
                </span>

                {/* LABEL */}

                <span
                  className="
                    font-medium
                  "
                >

                  {lang === "es"
                    ? item.labelES
                    : item.labelPT}

                </span>

              </Link>

            );
          })}

        </div>

      </nav>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div
        className="
          border-t
          border-[#355845]
          p-4
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-[#355845]
            bg-[#10251b]
            p-4
          "
        >

          <div
            className="
              text-xs
              uppercase
              tracking-[0.2em]
              text-[#b7d6c2]
            "
          >
            Runtime Cognitivo
          </div>

          <div
            className="
              mt-2
              text-sm
              font-semibold
              text-[#f3fff7]
            "
          >
            Triângulo 360 Online
          </div>

        </div>

      </div>

    </aside>

  );
}