"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type PiqueteForm = {
  nome: string;
  area: number;
  tipo_pasto: string;
  capacidade_ua: number;
  status: string;
};

export default function EditarPiquete() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<PiqueteForm>({
    nome: "",
    area: 0,
    tipo_pasto: "",
    capacidade_ua: 0,
    status: "ativo",
  });

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/pastagem/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            nome: data.nome || "",
            area: data.area || 0,
            tipo_pasto: data.tipo_pasto || "",
            capacidade_ua: data.capacidade_ua || 0,
            status: data.status || "ativo",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      }
      setLoading(false);
    }
    if (id) carregar();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch(`/api/pastagem/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/pt/dashboard/pastagem");
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
    setSalvando(false);
  };

  if (loading) {
    return <div className="p-10 text-[#A7F3D0]/60">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Editar Piquete</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#A7F3D0]/60">Nome *</label>
              <input
                type="text"
                className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-[#A7F3D0]/60">Área (ha) *</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-[#A7F3D0]/60">Tipo de Pasto</label>
              <input
                type="text"
                className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                value={form.tipo_pasto}
                onChange={(e) => setForm({ ...form, tipo_pasto: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-[#A7F3D0]/60">Capacidade (UA)</label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                value={form.capacidade_ua}
                onChange={(e) => setForm({ ...form, capacidade_ua: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm text-[#A7F3D0]/60">Status</label>
              <select
                className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ativo">Ativo</option>
                <option value="ocupado">Ocupado</option>
                <option value="em_manutencao">Em manutenção</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={salvando}
                className="px-6 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl border border-[#34D399]/20 text-[#A7F3D0]/70 hover:bg-[#34D399]/10 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}