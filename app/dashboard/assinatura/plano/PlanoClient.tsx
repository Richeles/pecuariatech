"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

const PLANOS = [
  { id: "basico", nome: "Básico", preco: 189.97, descricao: "Dashboard simples e intuitivo, controle básico de rebanho, controle essencial de pastagem, relatório mensal automático." },
  { id: "profissional", nome: "Profissional", preco: 389.97, descricao: "Relatórios avançados, exportação Excel, indicadores financeiros, alertas inteligentes." },
  { id: "ultra", nome: "Ultra", preco: 589.97, descricao: "IA operacional, análises avançadas, alertas estratégicos, motor analítico." },
  { id: "empresarial", nome: "Empresarial", preco: 789.97, descricao: "Gestão de equipes, governança operacional, relatórios personalizados, multioperações." },
  { id: "dominus", nome: "Dominus 360°", preco: 989.97, descricao: "CFO Autônomo, IA preditiva, relatórios financeiros, suporte prioritário." },
];

export default function PlanoClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [planoAtual, setPlanoAtual] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function loadPlano() {
      if (!user?.id) return;
      const res = await fetch(`/api/assinaturas/status?ts=${Date.now()}`, { credentials: "include" });
      const data = await res.json();
      if (data?.plano) setPlanoAtual(data.plano);
    }
    if (user?.id) loadPlano();
  }, [user]);

  const handleAssinar = async (plano: string) => {
    if (!user) {
      alert("Faça login para assinar um plano");
      window.location.href = "/pt/login";
      return;
    }

    setLoading(plano);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano,
          user_id: user.id,
          email: user.email,
          nome: user.user_metadata?.nome || user.email?.split("@")[0],
          plano_atual: planoAtual,
        }),
      });

      const data = await res.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao iniciar checkout: " + (data.error || "Tente novamente"));
        setLoading(null);
      }
    } catch (error) {
      console.error("Erro ao assinar:", error);
      alert("Erro ao processar assinatura. Tente novamente.");
      setLoading(null);
    }
  };

  const planoAtualInfo = PLANOS.find(p => p.id === planoAtual);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Escolha o Plano Ideal</h1>
          <p className="text-[#A7F3D0]/60 max-w-2xl mx-auto">
            Migre de plano com um clique. Cobramos apenas a diferença proporcional.
          </p>
          {planoAtual && (
            <p className="mt-3 text-sm text-[#34D399]">
              Plano atual: <span className="font-bold uppercase">{planoAtual}</span>
              {planoAtualInfo && ` – R$ ${planoAtualInfo.preco.toFixed(2)}/mês`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {PLANOS.map((p) => {
            const isActive = planoAtual === p.id;
            const isUpgrade = planoAtual && PLANOS.findIndex(x => x.id === p.id) > PLANOS.findIndex(x => x.id === planoAtual);
            const diff = isUpgrade ? p.preco - (planoAtualInfo?.preco || 0) : 0;

            return (
              <div key={p.id} className={`rounded-2xl border p-6 shadow-xl transition-all duration-200 hover:scale-[1.02] ${isActive ? "border-[#34D399] bg-[#1A3F2A]/80 ring-2 ring-[#34D399]/50" : "border-[#34D399]/20 bg-[#1A3F2A]/60 hover:border-[#34D399]/40"}`}>
                <h2 className="text-2xl font-bold text-white">{p.nome}</h2>
                <p className="text-[#A7F3D0]/60 text-sm mt-2 h-16">{p.descricao}</p>

                <div className="my-4">
                  {isUpgrade && diff > 0 ? (
                    <>
                      <span className="text-3xl font-bold text-white">R$ {diff.toFixed(2)}</span>
                      <span className="text-[#A7F3D0]/40 text-sm ml-1">(diferença)</span>
                      <p className="text-xs text-[#A7F3D0]/40 mt-1">Valor total: R$ {p.preco.toFixed(2)}/mês</p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-white">R$ {p.preco.toFixed(2)}</span>
                      <span className="text-[#A7F3D0]/40 text-sm ml-1">/ mês</span>
                    </>
                  )}
                </div>

                {isActive ? (
                  <button disabled className="w-full py-3 rounded-xl bg-[#34D399]/20 text-[#34D399] font-bold cursor-default border border-[#34D399]/30">
                    ✓ Plano Atual
                  </button>
                ) : isUpgrade ? (
                  <button onClick={() => handleAssinar(p.id)} disabled={loading === p.id} className="w-full py-3 rounded-xl bg-[#FBBF24] text-[#0F2A1A] font-bold hover:bg-[#F59E0B] transition disabled:opacity-50">
                    {loading === p.id ? "⏳ Processando..." : `⬆ Migrar por R$ ${diff.toFixed(2)}`}
                  </button>
                ) : (
                  <button onClick={() => handleAssinar(p.id)} disabled={loading === p.id} className="w-full py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50">
                    {loading === p.id ? "⏳ Processando..." : "Assinar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-xs text-[#A7F3D0]/30">
          <p>Os planos são renovados automaticamente a cada mês.</p>
          <p>É possível cancelar ou alterar o plano a qualquer momento.</p>
        </div>
      </div>
    </div>
  );
}