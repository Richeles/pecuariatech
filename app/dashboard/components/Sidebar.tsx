"use client";

// =========================================================
// PECUARIATECH
// SIDEBAR — NAVEGAÇÃO E ACESSO A MÓDULOS
//
// ESR + MPVEC SIMBIÓTICO
//
// X  = Interface / Experiência
// Y  = Status efetivo consultado no Supabase
// Z  = Autorização e governança
// π  = Resolução dos módulos
// Ω  = Coerência entre plano e interface
//
// REGRA:
// O frontend nunca concede um plano.
// O endpoint de status é a fonte da verdade.
// =========================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  getModulesForPlan,
  normalizePlan,
} from "@/app/lib/planos";

import UpgradePlano from "./UpgradePlano";

// =========================================================
// TEMA
// =========================================================

const pecuariaTheme = {
  sidebar: {
    background: "bg-[#0F2A1A]",
    text: "text-white",
    active: "bg-[#1A3F2A] text-[#34D399]",
  },
};

// =========================================================
// NAVEGAÇÃO
// =========================================================

const allItems = [
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
    labelPT: "Planilha Operacional",
    labelES: "Hoja de Cálculo",
    href: "/planilha-operacional",
    icon: "📊",
  },
  {
    labelPT: "Linha do Tempo",
    labelES: "Línea de Tiempo",
    href: "/linha-do-tempo",
    icon: "⏳",
  },
  {
    labelPT: "Planos",
    labelES: "Planes",
    href: "/assinatura/plano",
    icon: "🔒",
  },
];

// =========================================================
// TIPOS
// =========================================================

type SidebarProps = {
  lang?: "pt" | "es";
};

type SubscriptionStatus = {
  ativo?: boolean;
  plano?: string | null;
  is_admin?: boolean;
  reason?: string;
};

// =========================================================
// COMPONENTE
// =========================================================

export default function Sidebar({
  lang = "pt",
}: SidebarProps) {
  const pathname = usePathname();

  const [plano, setPlano] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // =======================================================
  // Y — CONSULTA DO STATUS EFETIVO
  // =======================================================

  const fetchPlano = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(
          "/api/assinaturas/status",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
            },
            signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Falha ao consultar assinatura: HTTP ${response.status}`
          );
        }

        const data =
          (await response.json()) as SubscriptionStatus;

        if (signal?.aborted) {
          return;
        }

        // A API precisa confirmar o acesso.
        // Não presumir plano pago em caso de resposta inválida.

        if (
          data.ativo !== true ||
          typeof data.plano !== "string"
        ) {
          setPlano("starter");
          return;
        }

        const planoCanonico = normalizePlan(data.plano);

        if (!planoCanonico) {
          console.error(
            "[ESR][SIDEBAR] Plano não reconhecido:",
            data.plano
          );

          setPlano("starter");
          return;
        }

        setPlano(planoCanonico);

        console.log(
          "[ESR][SIDEBAR] Plano efetivo confirmado:",
          {
            plano: planoCanonico,
            isAdmin: data.is_admin === true,
            origem: data.reason ?? "status_api",
          }
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "[ESR][SIDEBAR] Erro ao consultar plano:",
          error
        );

        // Falha de consulta não concede privilégios.
        setPlano("starter");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // =======================================================
  // CICLO DE VIDA
  // =======================================================

  useEffect(() => {
    const controller = new AbortController();

    void fetchPlano(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchPlano]);

  useEffect(() => {
    const controller = new AbortController();

    async function verificarAdminMaster() {
      try {
        const response = await fetch("/api/admin/me", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          setIsAdmin(false);
          return;
        }

        const data = await response.json();

        setIsAdmin(
          data.is_admin === true &&
          data.role === "master"
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("[ESR][SIDEBAR][ADMIN]", error);
        setIsAdmin(false);
      }
    }

    void verificarAdminMaster();

    return () => controller.abort();
  }, []);

  // =======================================================
  // π — RESOLUÇÃO DOS MÓDULOS
  // =======================================================

  const allowedModules = loading
    ? []
    : getModulesForPlan(plano);

  const filteredItems = allItems.filter((item) => {
    // Dashboard e Planos permanecem visíveis.
    if (
      item.href === "" ||
      item.href === "/assinatura/plano"
    ) {
      return true;
    }

    return allowedModules.includes(item.href);
  });

  // =======================================================
  // NORMALIZAÇÃO DE PLANO
  // =======================================================

  const planoCanonico = normalizePlan(plano);

  const isDominus =
    planoCanonico === "dominus";

  const isMaster =
    planoCanonico === "master";

  // =======================================================
  // X — INTERFACE
  // =======================================================

  return (
    <>
      <aside
        className={`hidden lg:flex w-[250px] flex-col border-r border-[#355845] ${pecuariaTheme.sidebar.background} ${pecuariaTheme.sidebar.text}`}
      >
        {/* IDENTIDADE */}

        <div className="border-b border-[#355845] p-6">
          <h1 className="text-[24px] font-black tracking-tight text-white">
            PecuariaTech
          </h1>

          <p className="mt-1 text-sm text-[#b7d6c2]">
            Gestão Inteligente
          </p>

          <p className="mt-0.5 text-[10px] text-[#b7d6c2]/60 tracking-[0.15em]">
            Prerrogativa de Simbiose Geral
          </p>

          {!loading && plano && (
            <p className="mt-1 text-[10px] text-[#34D399]/60 tracking-[0.1em] uppercase">
              Plano: {plano}
            </p>
          )}
        </div>

        {/* STATUS OPERACIONAL */}

        <div className="p-4">
          <div className="rounded-2xl border border-[#355845] bg-[#173126] p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#52b788] animate-pulse" />

              <span className="text-sm font-semibold text-[#f3fff7]">
                IA Operacional Ativa
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#b7d6c2]">
              Equação Y + Z estabilizada
            </p>
          </div>
        </div>

        {/* NAVEGAÇÃO */}

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const fullHref =
                `/${lang}/dashboard${item.href}`;

              const active =
                pathname === fullHref;

              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  prefetch={false}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 border transition-all duration-200 ${
                    active
                      ? `${pecuariaTheme.sidebar.active} border-[#4f9b68] shadow-xl scale-[1.01]`
                      : "border-transparent text-[#d7ffe5] hover:bg-[#214734] hover:border-[#4f9b68] hover:text-white"
                  }`}
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

            {isAdmin && (
              <Link
                href="/dashboard/admin"
                prefetch={false}
                className="flex items-center gap-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20 hover:text-white"
              >
                <span className="text-lg">⚙️</span>
                <span>Admin Master</span>
              </Link>
            )}
          </div>
        </nav>

        {/* =================================================
            UPGRADE
            Não aparece para Dominus ou Master.
        ================================================= */}

        {!isDominus &&
          !isMaster &&
          !loading && (
            <div className="px-4 pb-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-400 font-bold text-sm hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <span>⬆️</span>

                <span>
                  Upgrade para Dominus 360°
                </span>
              </button>

              <p className="text-[10px] text-[#A7F3D0]/30 text-center mt-1">
                Plano atual:{" "}
                <span className="uppercase font-bold text-[#A7F3D0]/50">
                  {plano}
                </span>
              </p>
            </div>
          )}

        {/* GOVERNANÇA */}

        <div className="border-t border-[#355845] p-4">
          <div className="rounded-2xl border border-[#355845] bg-[#10251b] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[#b7d6c2]">
              Runtime Cognitivo
            </div>

            <div className="mt-2 text-sm font-semibold text-[#f3fff7]">
              Triângulo 360 Online
            </div>

            <div className="mt-1 text-xs text-[#b7d6c2]">
              Y = Dados • Z = Governança • X = Experiência
            </div>

            <div className="mt-1 text-[10px] text-[#b7d6c2]/40 tracking-[0.1em]">
              Simbiose Geral • Evolução Contínua
            </div>
          </div>
        </div>
      </aside>

      {/* ===================================================
          MODAL DE UPGRADE
      =================================================== */}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <UpgradePlano
            onClose={() => {
              setShowUpgradeModal(false);
            }}
            onUpgradeSuccess={() => {
              // Não atribuir Dominus localmente.
              // O Supabase precisa confirmar o novo direito.

              setShowUpgradeModal(false);

              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
          />
        </div>
      )}
    </>
  );
}