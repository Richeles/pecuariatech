"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, Tag, Weight, Calendar, Users, Ruler, MapPin, ArrowLeft } from "lucide-react";

export default function NovoAnimal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "",
    peso_inicial: "",
    user_id: "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
    data_entrada: new Date().toISOString().split("T")[0],
    lote: "",
    brinco_id: "",
    raca: "",
    sexo: "M",
    data_nascimento: "",
    origem: "",
    observacoes: "",
    status: "ativo",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setSucesso(false);

    try {
      const response = await fetch("/api/rebanho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          peso_inicial: parseFloat(form.peso_inicial),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao cadastrar");
      setSucesso(true);
      setTimeout(() => router.push("/dashboard/rebanho"), 1500);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#A7F3D0]/60 hover:text-[#A7F3D0] mb-6 transition">
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <span className="bg-[#34D399]/20 p-3 rounded-2xl"><Tag className="w-8 h-8 text-[#34D399]" /></span>
            Central PecuariaTech – Gestão Inteligente do Rebanho
          </h1>
          <p className="text-[#A7F3D0]/70 text-lg">Cadastro e rastreamento inteligente premium</p>
        </div>

        <div className="rounded-3xl border border-[#34D399]/20 bg-[#1A3F2A]/80 backdrop-blur-sm p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm text-[#A7F3D0]/80">Nome *</label><div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#34D399]/50" /><input type="text" name="nome" value={form.nome} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Ex: Boi 123" required /></div></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Peso Inicial (kg) *</label><div className="relative"><Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#34D399]/50" /><input type="number" name="peso_inicial" value={form.peso_inicial} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="450" step="0.1" required /></div></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Lote</label><input type="text" name="lote" value={form.lote} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Lote Premium" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Data Entrada</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#34D399]/50" /><input type="date" name="data_entrada" value={form.data_entrada} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-[#34D399]/60" /></div></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Brinco / Chip *</label><div className="relative"><Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#34D399]/50" /><input type="text" name="brinco_id" value={form.brinco_id} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="BR999999" required /></div></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Raça</label><input type="text" name="raca" value={form.raca} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Nelore" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Sexo</label><select name="sexo" value={form.sexo} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60"><option value="M">Macho</option><option value="F">Fêmea</option></select></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Data Nascimento</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#34D399]/50" /><input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-[#34D399]/60" /></div></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Origem</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#34D399]/50" /><input type="text" name="origem" value={form.origem} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Fazenda Santa Maria" /></div></div>
              <div className="md:col-span-2"><label className="text-sm text-[#A7F3D0]/80">Observações</label><textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 resize-none" placeholder="Informações adicionais..." /></div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#34D399]/10">
              <div className="flex flex-wrap items-center gap-4">
                {erro && <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl"><AlertCircle className="w-5 h-5" /><span className="text-sm">{erro}</span></div>}
                {sucesso && <div className="flex items-center gap-2 text-[#34D399] bg-[#34D399]/10 px-4 py-2 rounded-xl"><CheckCircle className="w-5 h-5" /><span className="text-sm">Cadastrado com sucesso!</span></div>}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button type="button" onClick={() => router.back()} className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-[#34D399]/20 text-[#A7F3D0]/70 hover:bg-[#34D399]/10 transition">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-[#34D399] to-[#10B981] text-[#0F2A1A] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-lg shadow-[#34D399]/30 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : "Salvar Animal"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


