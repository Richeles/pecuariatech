"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase-browser";

type Plano = "starter" | "pro" | "master" | "dominus";

const PRECOS: Record<Plano, number> = {
  starter: 189.97,
  pro: 389.97,
  master: 589.97,
  dominus: 989.97,
};

const NOMES_PLANOS: Record<Plano, string> = {
  starter: "Básico",
  pro: "Profissional",
  master: "Ultra",
  dominus: "Dominus 360°",
};

const BENEFICIOS: Record<Plano, string[]> = {
  starter: ["Dashboard simples", "Controle de rebanho", "Relatório mensal"],
  pro: ["Relatórios avançados", "Exportação Excel", "Indicadores financeiros", "Alertas inteligentes"],
  master: ["IA operacional", "Análises avançadas", "Alertas estratégicos", "Motor analítico"],
  dominus: ["CFO Autônomo", "IA preditiva", "Relatórios personalizados", "Suporte prioritário"],
};

type Props = {
  onClose: () => void;
  onUpgradeSuccess?: () => void;
};

export default function UpgradePlano({ onClose, onUpgradeSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [planoAtual, setPlanoAtual] = useState<Plano>("starter");
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano>("dominus");
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [credito, setCredito] = useState(0);
  const [totalPagar, setTotalPagar] = useState(0);
  const [valorProporcionalNovo, setValorProporcionalNovo] = useState(0);
  const [upgradeRealizado, setUpgradeRealizado] = useState(false);
  const [erro, setErro] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        const res = await fetch(`/api/assinaturas/status?user_id=${user.id}`);
        const data = await res.json();
        console.log("[UpgradePlano] Resposta da API:", data);
        if (data.plano) {
          setPlanoAtual(data.plano);
          setDiasRestantes(data.dias_restantes || 0);
        } else {
          console.warn("[UpgradePlano] Nenhum plano retornado pela API.");
        }
      } catch (e) {
        console.error("Erro ao buscar status:", e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (diasRestantes > 0 && planoSelecionado !== planoAtual) {
      const valorMensalAtual = PRECOS[planoAtual] || 0;
      const valorDiarioAtual = valorMensalAtual / 30;
      const creditoCalculado = valorDiarioAtual * diasRestantes;

      const valorMensalNovo = PRECOS[planoSelecionado] || 0;
      const valorDiarioNovo = valorMensalNovo / 30;
      const valorProporcional = valorDiarioNovo * diasRestantes;
      const total = Math.max(0, valorProporcional - creditoCalculado);

      setCredito(creditoCalculado);
      setValorProporcionalNovo(valorProporcional);
      setTotalPagar(total);
    } else {
      setCredito(0);
      setValorProporcionalNovo(PRECOS[planoSelecionado] || 0);
      setTotalPagar(PRECOS[planoSelecionado] || 0);
    }
  }, [planoSelecionado, diasRestantes, planoAtual]);

  const handleUpgrade = async () => {
    if (planoSelecionado === planoAtual) {
      setErro("Selecione um plano diferente do atual.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/assinaturas/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          novo_plano: planoSelecionado,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao fazer upgrade");

      setUpgradeRealizado(true);
      if (onUpgradeSuccess) onUpgradeSuccess();

      if (typeof window !== "undefined") {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e: any) {
      setErro(e.message || "Erro ao processar upgrade");
    }
    setLoading(false);
  };

  const ordem = ["starter", "pro", "master", "dominus"];
  const indiceAtual = ordem.indexOf(planoAtual);
  const planosDisponiveis = ordem.slice(indiceAtual + 1) as Plano[];

  if (upgradeRealizado) {
    return (
      <div className="bg-[#1A3F2A]/90 rounded-3xl border border-[#34D399]/30 p-8 backdrop-blur-sm max-w-md w-full mx-auto">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-white">Upgrade concluído!</h2>
          <p className="text-[#A7F3D0]/60">
            Seu plano agora é <span className="font-bold text-[#34D399]">{NOMES_PLANOS[planoSelecionado]}</span>.
          </p>
          <div className="bg-[#0F2A1A]/50 rounded-xl p-4 border border-[#34D399]/20 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#A7F3D0]/60">Crédito utilizado</span>
              <span className="text-white font-medium">R$ {credito.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#A7F3D0]/60">Total pago</span>
              <span className="text-white font-medium">R$ {totalPagar.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#A7F3D0]/60">Validade</span>
              <span className="text-white font-medium">+{diasRestantes} dias</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A3F2A]/90 rounded-3xl border border-[#34D399]/20 p-6 backdrop-blur-sm max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Alterar Plano</h2>
        <button onClick={onClose} className="text-[#A7F3D0]/60 hover:text-white text-xl">
          ✕
        </button>
      </div>

      <p className="text-[#A7F3D0]/60 text-sm mb-4">
        Plano atual: <span className="font-bold text-[#34D399]">{NOMES_PLANOS[planoAtual] || "Indefinido"}</span>
        {diasRestantes > 0 && (
          <span className="ml-2 text-xs text-[#A7F3D0]/40">
            (restam {diasRestantes} dias • crédito: R$ {credito.toFixed(2)})
          </span>
        )}
      </p>

      {planosDisponiveis.length === 0 ? (
        <p className="text-[#A7F3D0]/60 text-center py-8">Você já está no plano máximo. 🏆</p>
      ) : (
        <div className="space-y-3">
          {planosDisponiveis.map((plano) => {
            const mensal = PRECOS[plano];
            const ehSelecionado = planoSelecionado === plano;
            const valorComDesconto = ehSelecionado ? totalPagar : mensal;

            return (
              <button
                key={plano}
                onClick={() => setPlanoSelecionado(plano)}
                className={`w-full p-4 rounded-xl border-2 text-left transition ${
                  ehSelecionado
                    ? "border-[#34D399] bg-[#34D399]/10"
                    : "border-[#34D399]/20 hover:border-[#34D399]/40"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{NOMES_PLANOS[plano]}</div>
                    <div className="text-xs text-[#A7F3D0]/60 mt-1 space-y-0.5">
                      {BENEFICIOS[plano].map((b, i) => (
                        <div key={i}>• {b}</div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    {ehSelecionado && diasRestantes > 0 ? (
                      <>
                        <div className="text-xl font-bold text-[#34D399]">R$ {valorComDesconto.toFixed(2)}</div>
                        <div className="text-xs text-[#A7F3D0]/40 line-through">R$ {mensal.toFixed(2)}/mês</div>
                        <div className="text-xs text-green-400">⬇️ -R$ {(mensal - valorComDesconto).toFixed(2)}</div>
                      </>
                    ) : (
                      <div className="text-xl font-bold text-[#34D399]">R$ {mensal.toFixed(2)}</div>
                    )}
                    <div className="text-xs text-[#A7F3D0]/40">/mês</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {erro && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {erro}
        </div>
      )}

      {planosDisponiveis.length > 0 && (
        <button
          onClick={handleUpgrade}
          disabled={loading || planoSelecionado === planoAtual}
          className="w-full mt-6 px-6 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50 text-center"
        >
          {loading ? "⏳ Processando..." : "🚀 Confirmar Upgrade"}
        </button>
      )}
    </div>
  );
}