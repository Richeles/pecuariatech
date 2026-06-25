"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, TrendingUp, Beef, Wheat, Droplets, Ruler, Calendar, ArrowLeft } from "lucide-react";

export default function NovoLote() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    user_id: "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
    lote: "",
    peso_inicial: "",
    peso_final: "",
    gmd: "",
    duracao_dias: "",
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    tipo_racao: "",
    suplemento: "",
    silagem: "",
    nutriente_principal: "",
    consumo_diario: "",
    eficiencia_conversao: "",
    custo_alimentar_dia: "",
    observacoes_nutricao: "",
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
      const response = await fetch("/api/engorda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          peso_inicial: parseFloat(form.peso_inicial),
          peso_final: form.peso_final ? parseFloat(form.peso_final) : null,
          gmd: form.gmd ? parseFloat(form.gmd) : null,
          duracao_dias: form.duracao_dias ? parseInt(form.duracao_dias) : null,
          consumo_diario: form.consumo_diario ? parseFloat(form.consumo_diario) : null,
          eficiencia_conversao: form.eficiencia_conversao ? parseFloat(form.eficiencia_conversao) : null,
          custo_alimentar_dia: form.custo_alimentar_dia ? parseFloat(form.custo_alimentar_dia) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao cadastrar");
      setSucesso(true);
      setTimeout(() => router.push("/dashboard/engorda"), 1500);
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
            <span className="bg-[#34D399]/20 p-3 rounded-2xl"><Beef className="w-8 h-8 text-[#34D399]" /></span>
            Central PecuariaTech – Performance e Conversão Animal
          </h1>
          <p className="text-[#A7F3D0]/70 text-lg">Cadastro de lotes e desempenho premium</p>
        </div>
        <div className="rounded-3xl border border-[#34D399]/20 bg-[#1A3F2A]/80 backdrop-blur-sm p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm text-[#A7F3D0]/80">Lote *</label><input type="text" name="lote" value={form.lote} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Lote A" required /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Peso Inicial (kg) *</label><input type="number" name="peso_inicial" value={form.peso_inicial} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="420" step="0.1" required /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Peso Final (kg)</label><input type="number" name="peso_final" value={form.peso_final} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="580" step="0.1" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">GMD (kg/dia)</label><input type="number" name="gmd" value={form.gmd} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="1.8" step="0.01" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Duração (dias)</label><input type="number" name="duracao_dias" value={form.duracao_dias} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="120" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Data Início</label><input type="date" name="data_inicio" value={form.data_inicio} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Data Fim</label><input type="date" name="data_fim" value={form.data_fim} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Tipo de Ração</label><input type="text" name="tipo_racao" value={form.tipo_racao} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Silagem de Milho" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Suplemento</label><input type="text" name="suplemento" value={form.suplemento} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Mineral" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Silagem</label><input type="text" name="silagem" value={form.silagem} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Milho" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Nutriente Principal</label><input type="text" name="nutriente_principal" value={form.nutriente_principal} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Energia" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Consumo Diário (kg MS)</label><input type="number" name="consumo_diario" value={form.consumo_diario} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="12.5" step="0.1" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Eficiência de Conversão</label><input type="number" name="eficiencia_conversao" value={form.eficiencia_conversao} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="0.85" step="0.01" /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Custo Alimentar (R$/dia)</label><input type="number" name="custo_alimentar_dia" value={form.custo_alimentar_dia} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="8.75" step="0.01" /></div>
              <div className="md:col-span-2"><label className="text-sm text-[#A7F3D0]/80">Observações Nutricionais</label><textarea name="observacoes_nutricao" value={form.observacoes_nutricao} onChange={handleChange} rows={3} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60 resize-none" placeholder="Detalhes sobre alimentação..." /></div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#34D399]/10">
              <div className="flex flex-wrap items-center gap-4">
                {erro && <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl"><AlertCircle className="w-5 h-5" /><span className="text-sm">{erro}</span></div>}
                {sucesso && <div className="flex items-center gap-2 text-[#34D399] bg-[#34D399]/10 px-4 py-2 rounded-xl"><CheckCircle className="w-5 h-5" /><span className="text-sm">Cadastrado com sucesso!</span></div>}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button type="button" onClick={() => router.back()} className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-[#34D399]/20 text-[#A7F3D0]/70 hover:bg-[#34D399]/10 transition">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-[#34D399] to-[#10B981] text-[#0F2A1A] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-lg shadow-[#34D399]/30 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : "Salvar Lote"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


