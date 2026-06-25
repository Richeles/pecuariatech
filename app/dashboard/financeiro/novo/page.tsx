"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, DollarSign, TrendingUp, TrendingDown, Calendar, Tag, ArrowLeft } from "lucide-react";

export default function NovoFinanceiro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    user_id: "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
    descricao: "",
    tipo: "entrada",
    valor: "",
    data_lancamento: new Date().toISOString().split("T")[0],
    categoria: "",
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
      const response = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          valor: parseFloat(form.valor),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao lançar");
      setSucesso(true);
      setTimeout(() => router.push("/dashboard/financeiro"), 1500);
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
            <span className="bg-[#34D399]/20 p-3 rounded-2xl"><DollarSign className="w-8 h-8 text-[#34D399]" /></span>
            Central PecuariaTech – Inteligência Financeira Rural
          </h1>
          <p className="text-[#A7F3D0]/70 text-lg">Cadastro de receitas e despesas premium</p>
        </div>
        <div className="rounded-3xl border border-[#34D399]/20 bg-[#1A3F2A]/80 backdrop-blur-sm p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm text-[#A7F3D0]/80">Descrição *</label><input type="text" name="descricao" value={form.descricao} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Venda de 10 bois" required /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Tipo *</label><div className="flex gap-4 mt-1"><label className="flex items-center gap-2 text-[#A7F3D0]/80"><input type="radio" name="tipo" value="entrada" checked={form.tipo === "entrada"} onChange={handleChange} className="accent-[#34D399]" /> <TrendingUp className="w-4 h-4 text-[#34D399]" /> Receita</label><label className="flex items-center gap-2 text-[#A7F3D0]/80"><input type="radio" name="tipo" value="saida" checked={form.tipo === "saida"} onChange={handleChange} className="accent-red-400" /> <TrendingDown className="w-4 h-4 text-red-400" /> Despesa</label></div></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Valor (R$) *</label><input type="number" name="valor" value={form.valor} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" placeholder="50000" step="0.01" required /></div>
              <div><label className="text-sm text-[#A7F3D0]/80">Data Lançamento</label><input type="date" name="data_lancamento" value={form.data_lancamento} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#34D399]/60" /></div>
              <div className="md:col-span-2"><label className="text-sm text-[#A7F3D0]/80">Categoria</label><input type="text" name="categoria" value={form.categoria} onChange={handleChange} className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl py-3 px-4 text-white placeholder-[#A7F3D0]/40 focus:ring-2 focus:ring-[#34D399]/60" placeholder="Venda, Compra, Alimentação..." /></div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[#34D399]/10">
              <div className="flex flex-wrap items-center gap-4">
                {erro && <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl"><AlertCircle className="w-5 h-5" /><span className="text-sm">{erro}</span></div>}
                {sucesso && <div className="flex items-center gap-2 text-[#34D399] bg-[#34D399]/10 px-4 py-2 rounded-xl"><CheckCircle className="w-5 h-5" /><span className="text-sm">Lançamento registrado!</span></div>}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button type="button" onClick={() => router.back()} className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-[#34D399]/20 text-[#A7F3D0]/70 hover:bg-[#34D399]/10 transition">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-[#34D399] to-[#10B981] text-[#0F2A1A] font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition shadow-lg shadow-[#34D399]/30 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : "Lançar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


