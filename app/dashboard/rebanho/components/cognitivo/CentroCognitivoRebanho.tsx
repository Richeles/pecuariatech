"use client";

type Props = {
  diagnostico?: {
    score_biologico?: number;
    risco?: string;
    compliance?: number;
    pressao?: number;
    temperatura?: number;
    sanidade?: number;
    peso?: number;
    ganho?: number;
  };
  advisory?: string[];
  decisao?: string;
};

export default function CentroCognitivoRebanho({
  diagnostico,
  advisory = [],
  decisao,
}: Props) {
  const scoreBiologico = diagnostico?.score_biologico ?? 0;
  const risco = diagnostico?.risco ?? "BAIXO";
  const compliance = diagnostico?.compliance ?? 0;

  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-1.5 text-xs font-black tracking-[0.25em] text-[#34D399]">
            CENTRO COGNITIVO BIOLÓGICO
          </div>
          <h2 className="text-2xl font-bold text-white mt-3">
            Governança Cognitiva Rebanho
          </h2>
          <p className="text-[#A7F3D0]/60 text-sm mt-1 max-w-3xl">
            Runtime cognitivo conectado ao motor biológico, brincos inteligentes, 
            pressão animal, sanidade operacional e rastreabilidade contínua.
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
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Score Biológico</div>
          <div className="text-3xl font-bold text-white mt-1">{scoreBiologico}</div>
        </div>
        <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Risco Operacional</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1">{risco}</div>
        </div>
        <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Compliance Sanitário</div>
          <div className="text-3xl font-bold text-white mt-1">{compliance}%</div>
        </div>
        <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-4 text-center">
          <div className="text-xs text-[#A7F3D0]/50 uppercase tracking-wider">Decisão Recomendada</div>
          <div className="text-sm font-bold text-[#A7F3D0]/80 mt-1">
            {decisao || "Sem decisão"}
          </div>
        </div>
      </div>

      {/* ENGINES COGNITIVAS ATIVAS */}
      <div className="mt-6 rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/40 p-4">
        <div className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-3">
          ENGINES COGNITIVAS ATIVAS
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "BRINCOS IOT",
            "SANIDADE AI",
            "PRESSÃO ANIMAL",
            "GMD ENGINE",
            "PESO EVOLUTIVO",
            "COMPLIANCE AI",
            "TRACEABILITY",
            "RUNTIME PYTHON",
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
    </div>
  );
}