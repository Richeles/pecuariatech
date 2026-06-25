"use client";

type Props = {
  diagnostico?: {
    gmd?: number;
    conversao?: number;
    eficiencia?: number;
    risco?: string;
    temperatura?: number;
    consumo?: number;
  };
  advisory?: string[];
  decisao?: string;
};

export default function CentroCognitivoEngorda({
  diagnostico,
  advisory = [],
  decisao,
}: Props) {
  const gmd = diagnostico?.gmd ?? 0;
  const conversao = diagnostico?.conversao ?? 0;
  const eficiencia = diagnostico?.eficiencia ?? 0;
  const risco = diagnostico?.risco ?? "MODERADO";

  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-1.5 text-xs font-black tracking-[0.25em] text-[#34D399]">
            ENGORDA COGNITIVE ENGINE
          </div>
          <h2 className="text-2xl font-bold text-white mt-3">
            Governança Cognitiva da Engorda
          </h2>
          <p className="text-[#A7F3D0]/60 text-sm mt-1 max-w-3xl">
            Plataforma cognitiva operacional integrada ao runtime PecuariaTech,
            monitorando GMD, conversão alimentar, pressão de cocho,
            eficiência nutricional, estresse térmico e governança produtiva.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-100">
            ● ONLINE
          </span>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">GMD</div>
          <div className="text-3xl font-bold text-white mt-1">{gmd.toFixed(2)} kg/dia</div>
        </div>
        <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Conversão</div>
          <div className="text-3xl font-bold text-white mt-1">{conversao.toFixed(1)} kg/kg</div>
        </div>
        <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Eficiência</div>
          <div className="text-3xl font-bold text-white mt-1">{eficiencia}%</div>
        </div>
        <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Risco</div>
          <div className={`text-2xl font-bold mt-1 ${risco === "BAIXO" ? "text-green-400" : risco === "MODERADO" ? "text-yellow-400" : "text-red-400"}`}>
            {risco}
          </div>
        </div>
      </div>

      {/* ENGINES COGNITIVAS */}
      <div className="mt-6 rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/40 p-4">
        <div className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-3">
          ENGINES COGNITIVAS ATIVAS
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "GMD ENGINE",
            "COCHO AI",
            "THERMAL AI",
            "NUTRITION AI",
            "LOTE AI",
            "PESO EVOLUTIVO",
            "ESG AI",
            "COMPLIANCE AI",
          ].map((engine) => (
            <span
              key={engine}
              className="rounded-full border border-[#34D399]/20 bg-[#0F2A1A]/60 px-3 py-1.5 text-xs font-bold text-[#34D399]"
            >
              {engine}
            </span>
          ))}
        </div>
      </div>

      {/* ADVISORY */}
      {advisory.length > 0 && (
        <div className="mt-4 space-y-2">
          {advisory.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-400">
              {item}
            </div>
          ))}
        </div>
      )}

      {/* DECISÃO EXECUTIVA */}
      <div className="mt-4 rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/30 p-4">
        <div className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider">Decisão Executiva</div>
        <div className="text-white font-medium mt-1">
          {decisao || "Manter protocolo nutricional e monitorar eficiência térmica."}
        </div>
      </div>
    </div>
  );
}