"use client";

type Props = {
  area_total_ha?: number;
  area_utilizada_ha?: number;
  area_disponivel_ha?: number;
  ocupacao_percentual?: number;
};

export default function PastagemResumoCard({
  area_total_ha = 0,
  area_utilizada_ha = 0,
  area_disponivel_ha = 0,
  ocupacao_percentual = 0,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-white mb-4">📊 Resumo da Pastagem</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0F2A1A]/50 rounded-xl p-4 text-center border border-[#34D399]/10">
          <div className="text-2xl font-bold text-white">{area_total_ha.toFixed(1)} ha</div>
          <div className="text-xs text-[#A7F3D0]/50">Área Total</div>
        </div>
        <div className="bg-[#0F2A1A]/50 rounded-xl p-4 text-center border border-[#34D399]/10">
          <div className="text-2xl font-bold text-white">{area_utilizada_ha.toFixed(1)} ha</div>
          <div className="text-xs text-[#A7F3D0]/50">Área Utilizada</div>
        </div>
        <div className="bg-[#0F2A1A]/50 rounded-xl p-4 text-center border border-[#34D399]/10">
          <div className="text-2xl font-bold text-white">{area_disponivel_ha.toFixed(1)} ha</div>
          <div className="text-xs text-[#A7F3D0]/50">Área Disponível</div>
        </div>
        <div className="bg-[#0F2A1A]/50 rounded-xl p-4 text-center border border-[#34D399]/10">
          <div className="text-2xl font-bold text-white">{ocupacao_percentual.toFixed(0)}%</div>
          <div className="text-xs text-[#A7F3D0]/50">Ocupação</div>
        </div>
      </div>
    </div>
  );
}