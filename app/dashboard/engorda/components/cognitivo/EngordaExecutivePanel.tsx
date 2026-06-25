"use client";

type Props = {
  total?: number;
  margem?: number;
  risco?: string;
  pi?: number;
  compliance?: number;
  esg?: string;
  alertas?: string[];
};

export default function EngordaExecutivePanel({
  total = 0,
  margem = 0,
  risco = "BAIXO",
  pi = 94,
  compliance = 96,
  esg = "VERDE",
  alertas = [],
}: Props) {
  return (
    <div className="space-y-6">
      {/* HERO EXECUTIVO */}
      <div className="relative overflow-hidden rounded-2xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 md:p-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_35%)]" />
        <div className="relative z-10 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-200">
              Ultra Biological Engorda Runtime
            </div>
            <h3 className="text-2xl font-black text-white">Governança Cognitiva da Engorda</h3>
            <p className="text-[#A7F3D0]/60 text-sm max-w-2xl">
              Runtime executivo integrado ao motor π cognitivo PecuariaTech,
              com inteligência biológica, eficiência nutricional, projeção operacional,
              rastreabilidade ESG e monitoramento contínuo.
            </p>
            <div className="flex flex-wrap gap-2">
              {["π ENGINE", "GMD AI", "FEED AI", "RISK AI", "TRACEABILITY", "ESG", "BIOLOGICAL AI"].map((item) => (
                <span key={item} className="rounded-full border border-[#34D399]/10 bg-[#34D399]/5 px-3 py-1 text-[10px] font-bold text-[#A7F3D0]/70">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A7F3D0]/50">Score π</div>
              <div className="text-3xl font-bold text-white">{pi}</div>
            </div>
            <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A7F3D0]/50">Risco</div>
              <div className={`text-2xl font-bold ${risco === "BAIXO" ? "text-green-400" : risco === "MODERADO" ? "text-yellow-400" : "text-red-400"}`}>
                {risco}
              </div>
            </div>
            <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A7F3D0]/50">Compliance</div>
              <div className="text-3xl font-bold text-white">{compliance}%</div>
            </div>
            <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A7F3D0]/50">ESG</div>
              <div className="text-3xl font-bold text-[#34D399]">{esg}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Animais em Engorda</div>
          <div className="text-3xl font-bold text-white">{total}</div>
          <div className="text-xs text-[#A7F3D0]/40 mt-1">Lotes monitorados</div>
        </div>
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Margem Média</div>
          <div className="text-3xl font-bold text-white">R$ {margem.toFixed(0)}</div>
          <div className="text-xs text-[#A7F3D0]/40 mt-1">Resultado operacional</div>
        </div>
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Governança ESG</div>
          <div className="text-3xl font-bold text-[#34D399]">{esg}</div>
          <div className="text-xs text-[#A7F3D0]/40 mt-1">Conformidade ambiental</div>
        </div>
      </div>

      {/* ALERTAS */}
      {(alertas.length > 0 || true) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(alertas.length > 0 ? alertas : [
            "Conversão alimentar acima do ideal.",
            "Ganho de peso abaixo do ótimo.",
            "Pressão térmica elevada.",
            "Ajustar estratégia nutricional.",
          ]).map((alerta, idx) => (
            <div key={idx} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-400">
              {alerta}
            </div>
          ))}
        </div>
      )}

      {/* CENÁRIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Cenário Ótimo</div>
          <div className="text-lg font-bold text-white">Maior margem</div>
          <p className="text-[#A7F3D0]/60 text-sm mt-2">Estratégia focada em eficiência alimentar e maximização operacional.</p>
        </div>
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Cenário Seguro</div>
          <div className="text-lg font-bold text-white">Menor risco</div>
          <p className="text-[#A7F3D0]/60 text-sm mt-2">Estratégia balanceada priorizando estabilidade sanitária e previsibilidade.</p>
        </div>
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-5">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Cenário Rápido</div>
          <div className="text-lg font-bold text-white">Maior giro</div>
          <p className="text-[#A7F3D0]/60 text-sm mt-2">Estratégia voltada à aceleração de giro e liquidez operacional.</p>
        </div>
      </div>
    </div>
  );
}