"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Piquete = {
  id?: string;
  piquete_id?: string;
  nome?: string;
  area_ha?: number;
  tipo_pasto?: string;
  capacidade_ua?: number;
  status?: string;
  ultima_movimentacao_em?: string;
};

type Props = {
  piquetes?: Piquete[];
  onRefresh?: () => void;
};

export default function PastagemPiquetesTable({ piquetes = [], onRefresh }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const excluirPiquete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este piquete?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/pastagem?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
        router.refresh();
      } else {
        alert("Erro ao excluir piquete");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao excluir piquete");
    }
    setDeleting(null);
  };

  if (!piquetes || piquetes.length === 0) {
    return (
      <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 text-center">
        <p className="text-[#A7F3D0]/60">Nenhum piquete cadastrado.</p>
        <Link
          href="/dashboard/pastagem/novo"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition"
        >
          ➕ Cadastrar Primeiro Piquete
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-[#34D399]/10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">📋 Piquetes</h3>
        <Link
          href="/dashboard/pastagem/novo"
          className="px-3 py-1.5 text-sm rounded-xl bg-[#34D399]/20 text-[#34D399] font-bold hover:bg-[#34D399]/30 transition"
        >
          ➕ Novo
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0F2A1A]/50">
            <tr>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Nome</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Área (ha)</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Tipo</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Capacidade</th>
              <th className="p-3 text-left text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Status</th>
              <th className="p-3 text-center text-xs font-black uppercase tracking-wider text-[#A7F3D0]/50">Ações</th>
            </tr>
          </thead>
          <tbody>
            {piquetes.map((p) => {
              const id = p.id || p.piquete_id;
              return (
                <tr key={id} className="border-t border-[#34D399]/5 hover:bg-[#34D399]/5 transition-colors">
                  <td className="p-3 font-medium text-white">{p.nome || "—"}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{p.area_ha?.toFixed(1) ?? "—"}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{p.tipo_pasto || "—"}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{p.capacidade_ua?.toFixed(1) ?? "—"} UA</td>
                  <td className="p-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      p.status === "ativo" 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : p.status === "ocupado"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}>
                      {p.status || "—"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/dashboard/pastagem/${id}/editar`}
                        className="text-[#34D399] hover:text-[#10B981] transition text-sm"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => id && excluirPiquete(id)}
                        disabled={deleting === id}
                        className="text-red-400 hover:text-red-300 transition text-sm disabled:opacity-50"
                      >
                        {deleting === id ? "..." : "🗑️"}
                      </button>
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