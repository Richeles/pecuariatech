"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase-browser";

const supabase = createClient();

export default function ContasPage() {
  const [contas, setContas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    tipo: "pagar",
    vencimento: "",
    fornecedor: "",
    cliente: "",
    status: "pendente",
  });

  useEffect(() => {
    carregarContas();
  }, []);

  async function carregarContas() {
    const { data } = await supabase
      .from("contas")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .order("vencimento", { ascending: true });
    setContas(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    await supabase.from("contas").insert({
      ...form,
      valor: parseFloat(form.valor),
      user_id: user.id,
    });

    setForm({ descricao: "", valor: "", tipo: "pagar", vencimento: "", fornecedor: "", cliente: "", status: "pendente" });
    carregarContas();
  }

  if (loading) return <div className="p-10 text-[#A7F3D0]/60">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">📋 Contas a Pagar / Receber</h1>
        <p className="text-[#A7F3D0]/60">Gerencie seus compromissos financeiros e programe pagamentos.</p>

        <form onSubmit={handleSubmit} className="bg-[#1A3F2A]/60 p-6 rounded-2xl border border-[#34D399]/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Descrição *"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$) *"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
            <select
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="pagar">💰 Conta a Pagar</option>
              <option value="receber">📈 Conta a Receber</option>
            </select>
            <input
              type="date"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white"
              value={form.vencimento}
              onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
              required
            />
            <input
              placeholder="Fornecedor (se pagar)"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white"
              value={form.fornecedor}
              onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
            />
            <input
              placeholder="Cliente (se receber)"
              className="bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white"
              value={form.cliente}
              onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            />
          </div>
          <button type="submit" className="px-6 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition">
            ➕ Adicionar Lançamento
          </button>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 p-4">
          <table className="w-full text-sm">
            <thead className="bg-[#0F2A1A]/50">
              <tr>
                <th className="p-3 text-left text-[#A7F3D0]/50">Vencimento</th>
                <th className="p-3 text-left text-[#A7F3D0]/50">Descrição</th>
                <th className="p-3 text-left text-[#A7F3D0]/50">Tipo</th>
                <th className="p-3 text-right text-[#A7F3D0]/50">Valor</th>
                <th className="p-3 text-left text-[#A7F3D0]/50">Status</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((c) => (
                <tr key={c.id} className="border-t border-[#34D399]/10">
                  <td className="p-3 text-[#A7F3D0]/80">{new Date(c.vencimento).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{c.descricao}</td>
                  <td className="p-3 text-[#A7F3D0]/80">{c.tipo === "pagar" ? "💰 Pagar" : "📈 Receber"}</td>
                  <td className="p-3 text-right text-white">R$ {c.valor.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.status === "pago" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {c.status || "pendente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}