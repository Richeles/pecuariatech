"use client";

export default function PastagemTriangulo360() {
  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">🔺 Triângulo 360</h3>
          <p className="text-[#A7F3D0]/60 text-sm mt-1">
            Y = Dados • Z = Governança • X = Experiência
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-100">
            ● ATIVO
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-[#0F2A1A]/50 rounded-xl p-4 text-center border border-[#34D399]/10">
          <div className="text-2xl font-bold text-[#34D399]">Y</div>
          <div className="text-xs text-[#A7F3D0]/50">Dados</div>
        </div>
        <div className="bg-[#0F2A1A]/50 rounded-xl p-4 text-center border border-[#34D399]/10">
          <div className="text-2xl font-bold text-[#34D399]">Z</div>
          <div className="text-xs text-[#A7F3D0]/50">Governança</div>
        </div>
        <div className="bg-[#0F2A1A]/50 rounded-xl p-4 text-center border border-[#34D399]/10">
          <div className="text-2xl font-bold text-[#34D399]">X</div>
          <div className="text-xs text-[#A7F3D0]/50">Experiência</div>
        </div>
      </div>
    </div>
  );
}