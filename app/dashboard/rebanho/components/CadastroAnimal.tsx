"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AnimalForm = {
  brinco: string;
  nome: string;
  raca: string;
  sexo: "M" | "F";
  peso_inicial: number;
  data_entrada: string;
  lote: string;
  origem: string;
  observacoes: string;
};

export default function CadastroAnimal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AnimalForm>({
    brinco: "",
    nome: "",
    raca: "",
    sexo: "M",
    peso_inicial: 0,
    data_entrada: new Date().toISOString().split("T")[0],
    lote: "",
    origem: "",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/rebanho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          user_id: "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          brinco: "",
          nome: "",
          raca: "",
          sexo: "M",
          peso_inicial: 0,
          data_entrada: new Date().toISOString().split("T")[0],
          lote: "",
          origem: "",
          observacoes: "",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-[#34D399]">🐄</span> Cadastrar Animal
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition shadow-lg shadow-[#34D399]/30"
        >
          {showForm ? "✕ Fechar" : "+ Novo Animal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Brinco *"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.brinco}
              onChange={(e) => setForm({ ...form, brinco: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Nome"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <input
              type="text"
              placeholder="Raça"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.raca}
              onChange={(e) => setForm({ ...form, raca: e.target.value })}
            />
            <select
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.sexo}
              onChange={(e) => setForm({ ...form, sexo: e.target.value as "M" | "F" })}
            >
              <option value="M">Macho</option>
              <option value="F">Fêmea</option>
            </select>
            <input
              type="number"
              placeholder="Peso Inicial (kg)"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.peso_inicial}
              onChange={(e) => setForm({ ...form, peso_inicial: parseFloat(e.target.value) })}
            />
            <input
              type="date"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.data_entrada}
              onChange={(e) => setForm({ ...form, data_entrada: e.target.value })}
            />
            <input
              type="text"
              placeholder="Lote"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.lote}
              onChange={(e) => setForm({ ...form, lote: e.target.value })}
            />
            <input
              type="text"
              placeholder="Origem"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none"
              value={form.origem}
              onChange={(e) => setForm({ ...form, origem: e.target.value })}
            />
          </div>
          <textarea
            placeholder="Observações"
            className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 focus:outline-none resize-none"
            rows={2}
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#34D399] to-[#10B981] text-[#0F2A1A] font-bold hover:scale-[1.02] transition shadow-lg shadow-[#34D399]/30 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Cadastrar Animal"}
          </button>
        </form>
      )}
    </div>
  );
}