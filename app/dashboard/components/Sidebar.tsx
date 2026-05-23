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
        hidden
        lg:flex
        w-[240px]
        flex-col
        border-r
        border-[#284135]
        bg-gradient-to-b
        from-[#081b12]
        via-[#0d2418]
        to-[#081b12]
        text-white
      "
    >

      {/* LOGO */}

      <div
        className="
          border-b
          border-[#284135]
          p-6
        "
      >

        <h1
          className="
            text-[22px]
            font-black
            tracking-tight
            text-white
          "
        >
          PecuariaTech
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-relaxed
            text-green-100/70
          "
        >
          Gestão inteligente pecuária
        </p>

      </div>

      {/* STATUS */}

      <div className="p-4">

        <div
          className="
            rounded-2xl
            border
            border-[#315240]
            bg-[#173325]
            p-4
            shadow-xl
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                h-2
                w-2
                rounded-full
                bg-green-400
                animate-pulse
              "
            />

            <span
              className="
                text-sm
                font-semibold
                text-green-100
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
              text-green-100/70
            "
          >
            Plataforma analítica estabilizada
          </p>

        </div>

      </div>

      {/* MENU */}

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
                        hover:bg-[#214734]
                        hover:border-[#315240]
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

      {/* FOOTER */}

      <div
        className="
          border-t
          border-[#284135]
          p-4
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-[#315240]
            bg-[#10251b]
            p-4
          "
        >

          <div
            className="
              text-xs
              uppercase
              tracking-[0.2em]
              text-green-100/50
            "
          >
            Runtime Cognitivo
          </div>

          <div
            className="
              mt-2
              text-sm
              font-semibold
              text-green-100
            "
          >
            Triângulo 360 Online
          </div>

        </div>

      </div>

    </aside>

  );
}