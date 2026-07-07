"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getModulesForPlan } from "@/app/lib/planos";
import UpgradePlano from "./UpgradePlano";

const pecuariaTheme = {
  sidebar: {
    background: "bg-[#0F2A1A]",
    text: "text-white",
    active: "bg-[#1A3F2A] text-[#34D399]",
  },
};

const allItems = [
  { labelPT: "Dashboard", labelES: "Panel", href: "", icon: "🏠" },
  { labelPT: "Financeiro", labelES: "Finanzas", href: "/financeiro", icon: "💰" },
  { labelPT: "Rebanho", labelES: "Ganado", href: "/rebanho", icon: "🐄" },
  { labelPT: "Pastagem", labelES: "Pastura", href: "/pastagem", icon: "🌱" },
  { labelPT: "CFO Inteligente", labelES: "CFO Inteligente", href: "/cfo", icon: "🧠" },
  { labelPT: "Engorda", labelES: "Engorde", href: "/engorda", icon: "⚡" },
  { labelPT: "Planilha Operacional", labelES: "Hoja de Cálculo", href: "/planilha-operacional", icon: "📊" },
  { labelPT: "Linha do Tempo", labelES: "Línea de Tiempo", href: "/linha-do-tempo", icon: "⏳" },
  // NURA removida permanentemente
  { labelPT: "Planos", labelES: "Planes", href: "/assinatura/plano", icon: "🔒" },
];

export default function Sidebar({ lang = "pt" }: { lang?: "pt" | "es" }) {
  const pathname = usePathname();
  const [plano, setPlano] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    async function fetchPlano() {
      try {
        const res = await fetch("/api/assinaturas/status");
        const data = await res.json();
        console.log("[Sidebar] Plano via API:", data?.plano);
        setPlano(data?.plano || "basico");
      } catch (e) {
        console.error("[Sidebar] Erro ao buscar plano:", e);
        setPlano("basico");
      }
      setLoading(false);
    }
    fetchPlano();
  }, []);

  const allowedModules = loading ? [] : getModulesForPlan(plano);

  const filteredItems = allItems.filter((item) => {
    // Dashboard e Planos sempre visíveis
    if (item.href === "" || item.href === "/assinatura/plano") return true;
    return allowedModules.includes(item.href);
  });

  const isDominus = plano === "dominus";

  return (
    <>
      <aside
        className={`hidden lg:flex w-[250px] flex-col border-r border-[#355845] ${pecuariaTheme.sidebar.background} ${pecuariaTheme.sidebar.text}`}
      >
        <div className="border-b border-[#355845] p-6">
          <h1 className="text-[24px] font-black tracking-tight text-white">PecuariaTech</h1>
          <p className="mt-1 text-sm text-[#b7d6c2]">Gestão Inteligente</p>
          <p className="mt-0.5 text-[10px] text-[#b7d6c2]/60 tracking-[0.15em]">
            Prerrogativa de Simbiose Geral
          </p>
          {!loading && plano && (
            <p className="mt-1 text-[10px] text-[#34D399]/60 tracking-[0.1em] uppercase">
              Plano: {plano}
            </p>
          )}
        </div>

        <div className="p-4">
          <div className="rounded-2xl border border-[#355845] bg-[#173126] p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#52b788] animate-pulse" />
              <span className="text-sm font-semibold text-[#f3fff7]">IA Operacional Ativa</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#b7d6c2]">
              Equação Y + Z estabilizada
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const fullHref = `/${lang}/dashboard${item.href}`;
              const active = pathname === fullHref;
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
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">
                    {lang === "es" ? item.labelES : item.labelPT}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ============================================================
            BOTÃO DE UPGRADE NA SIDEBAR (somente se NÃO for Dominus)
        ============================================================ */}
        {!isDominus && !loading && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-400 font-bold text-sm hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <span>⬆️</span>
              <span>Upgrade para Dominus 360°</span>
            </button>
            <p className="text-[10px] text-[#A7F3D0]/30 text-center mt-1">
              Plano atual: <span className="uppercase font-bold text-[#A7F3D0]/50">{plano}</span>
            </p>
          </div>
        )}

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

      {/* Modal de upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <UpgradePlano
            onClose={() => setShowUpgradeModal(false)}
            onUpgradeSuccess={() => {
              setPlano("dominus");
              setShowUpgradeModal(false);
              // Recarregar a página para refletir o novo plano em toda a aplicação
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