"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, MapPin, Leaf, Sprout, Droplet, Sun, Ruler, ArrowLeft } from "lucide-react";

export default function NovoPiquete() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    user_id: "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
    nome: "",
    tipo_forragem: "",
    area: "",
    data_plantio: new Date().toISOString().split("T")[0],
    nutriente_indicado: "",
    tipo_manejo: "",
    irrigacao: "",
    qualidade_solo: "",
    produtividade_estimada: "",
    capacidade_suporte: "",
    observacoes: "",
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
      const response = await fetch("/api/pastagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          area: parseFloat(form.area),
          produtividade_estimada: form.produtividade_estimada ? parseFloat(form.produtividade_estimada) : null,
          capacidade_suporte: form.capacidade_suporte ? parseFloat(form.capacidade_suporte) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao cadastrar");
      setSucesso(true);
      setTimeout(() => router.push("/dashboard/pastagem"), 1500);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#A7F3D0]/60 hover:text-[#A7F3D0] mb-6 transition"><ArrowLeft className="w-5 h-5" /> Voltar</button>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <span className="bg-[#34D399]/20 p-3 rounded-2xl"><Leaf className="w-8 h-8 text-[#34D399]" /></span>
            Central PecuariaTech – Gestão Estratégica de Pastagens
          </h1>
          <p className="text-[#A7F3D0]/70 text-lg">Cadastro e gestão nutricional premium</p>
        </div>
        <div className="rounded-3xl border border-[#34D399]/20 bg-[#1A3F2A]/80 backdrop-blur-sm p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm text-[#A7F3D0]/80">Nome do Piquete *</label><input type="text" name="nome" value={form.nome} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Piquete 4" required /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Área (ha) *</label><input type="number" name="area" value={form.area} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="25" step="0.1" required /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Tipo de Forragem</label><input type="text" name="tipo_forragem" value={form.tipo_forragem} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Brachiaria" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Data Plantio</label><input type="date" name="data_plantio" value={form.data_plantio} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Nutriente Indicado</label><input type="text" name="nutriente_indicado" value={form.nutriente_indicado} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Nitrogênio" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Tipo de Manejo</label><select name="tipo_manejo" value={form.tipo_manejo} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60"><option value="">Selecione</option><option value="Rotacionado">Rotacionado</option><option value="Contínuo">Contínuo</option><option value="Intensivo">Intensivo</option></select></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Irrigação</label><input type="text" name="irrigacao" value={form.irrigacao} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Aspersão" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Qualidade do Solo</label><select name="qualidade_solo" value={form.qualidade_solo} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60"><option value="">Selecione</option><option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option></select></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Produtividade Estimada (kg MS/ha/ano)</label><input type="number" name="produtividade_estimada" value={form.produtividade_estimada} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="12.5" step="0.1" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Capacidade de Suporte (UA/ha)</label><input type="number" name="capacidade_suporte" value={form.capacidade_suporte} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="2.2" step="0.1" /></div>
              <div className="md:col-span-2"><label className="text-sm text-[#A7F3D0]/80">Observações</label><textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 resize-none" placeholder="Informações nutricionais adicionais..." /></div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#34D399]/10">
              <div className="flex flex-wrap items-center gap-4">
                {erro && <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl"><AlertCircle className="w-5 h-5" /><span className="text-sm">{erro}</span></div>}
                {sucesso && <div className="flex items-center gap-2 text-[#34D399] bg-[#34D399]/10 px-4 py-2 rounded-xl"><CheckCircle className="w-5 h-5" /><span className="text-sm">Cadastrado com sucesso!</span></div>}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button type="button" onClick={() => router.back()} className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-[#34D399]/20 text-[#A7F3D0]/70 hover:bg-[#34D399]/10 transition">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-[#34D399] to-[#10B981] text-[#0F2A1A] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-lg shadow-[#34D399]/30 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : "Salvar Piquete"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


