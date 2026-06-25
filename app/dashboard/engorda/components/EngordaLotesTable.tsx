"use client";

import Link from "next/link";

type Lote = {
  id?: string;
  lote?: string;
  peso_inicial?: number;
  peso_atual?: number;
  peso_final?: number;
  gmd?: number;
  duracao_dias?: number;
  data_inicio?: string;
  data_fim?: string;
  tipo_racao?: string;
  suplemento?: string;
  silagem?: string;
  consumo_diario?: number;
  status?: string;
};

type Props = {
  lotes?: Lote[];
  onRefresh?: () => void;
};

export default function EngordaLotesTable({ lotes = [], onRefresh }: Props) {
  if (!lotes || lotes.length === 0) {
    return (
      <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 text-center">
        <p className="text-[#A7F3D0]/60">Nenhum lote cadastrado.</p>
        <Link
          href="/dashboard/engorda/novo"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition"
        >
          ➕ Cadastrar Primeiro Lote
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-[#34D399]/10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">📋 Lotes em Engorda</h3>
        <Link
          href="/dashboard/engorda/novo"
          className="px-3 py-1.5 text-sm rounded-xl bg-[#34D399]/20 text-[#34D399] font-bold hover:bg-[#34D399]/30 transition"
        >
          ➕ Novo Lote
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0F2A1A]/50">
            <tr>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Lote</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Peso Atual</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">GMD</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Ração</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Suplemento</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Consumo</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Status</th>
              <th className="p-3 text-center text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((l, index) => {
              // ✅ Garantir uma key única
              const id = l.id || l.lote || `lote-${index}`;
              const peso = l.peso_atual || l.peso_final || l.peso_inicial || 0;
              const statusClass =
                l.status === "ativo" || !l.status
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : l.status === "finalizado"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
              return (
                <tr key={id} className="border-t border-[#34D399]/5 hover:bg-[#34D399]/5 transition-colors">
                  <td className="p-3 font-medium text-white">{l.lote || "—"}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{peso.toFixed(1)} kg</td>
                  <td className="p-3 text-[#A7F3D0]/80">{l.gmd?.toFixed(2) || "—"}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{l.tipo_racao || "—"}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{l.suplemento || "—"}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{l.consumo_diario?.toFixed(1) || "—"} kg</td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}>
                      {l.status || "ativo"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/dashboard/engorda/${id}/nutricao`}
                        className="text-[#34D399] hover:text-[#10B981] transition text-sm"
                        title="Editar Nutrição"
                      >
                        🌾
                      </Link>
                      <Link
                        href={`/dashboard/engorda/${id}/editar`}
                        className="text-[#34D399] hover:text-[#10B981] transition text-sm"
                        title="Editar Lote"
                      >
                        ✏️
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}