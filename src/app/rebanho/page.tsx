"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Animal = {
  id: string;
  brinco: string | null;
  raca: string | null;
  peso: number | null;
  peso_inicial: number | null;
  piquete: string | null;
  status_biologico: string | null;
};

export default function RebanhoPage() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [form, setForm] = useState({
    brinco: "",
    raca: "",
    peso_inicial: "",
    peso: "",
    piquete: "",
  });
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from("animais")
      .select("*")
      .order("criado_em", { ascending: false });
    setAnimais((data as Animal[]) || []);
    setCarregando(false);
  }

  async function salvar() {
    if (!form.brinco) return;

    await supabase.from("animais").insert([
      {
        brinco: form.brinco,
        raca: form.raca,
        peso_inicial: form.peso_inicial
          ? Number(form.peso_inicial)
          : null,
        peso: form.peso ? Number(form.peso) : null,
        piquete: form.piquete,
      },
    ]);

    setForm({ brinco: "", raca: "", peso_inicial: "", peso: "", piquete: "" });
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">🐂 Gestão de Rebanho</h1>

      <div className="bg-white/90 p-4 rounded-2xl shadow max-w-md mb-6 space-y-2">
        <input
          className="border p-2 w-full rounded"
          placeholder="Brinco"
          value={form.brinco}
          onChange={(e) => setForm({ ...form, brinco: e.target.value })}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Raça"
          value={form.raca}
          onChange={(e) => setForm({ ...form, raca: e.target.value })}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Peso inicial (kg)"
          value={form.peso_inicial}
          onChange={(e) => setForm({ ...form, peso_inicial: e.target.value })}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Peso atual (kg)"
          value={form.peso}
          onChange={(e) => setForm({ ...form, peso: e.target.value })}
        />
        <input
          className="border p-2 w-full rounded"
          placeholder="Piquete"
          value={form.piquete}
          onChange={(e) => setForm({ ...form, piquete: e.target.value })}
        />

        <button
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded w-full font-semibold"
          onClick={salvar}
        >
          ➕ Registrar animal
        </button>
      </div>

      {carregando && <p>Carregando rebanho...</p>}

      <table className="bg-white/95 w-full shadow rounded-2xl overflow-hidden text-sm">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="p-2 text-left">Brinco</th>
            <th className="p-2 text-left">Raça</th>
            <th className="p-2 text-left">Peso</th>
            <th className="p-2 text-left">Piquete</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {animais.map((a) => (
            <tr key={a.id} className="border-b last:border-none">
              <td className="p-2">{a.brinco}</td>
              <td className="p-2">{a.raca}</td>
              <td className="p-2">{a.peso ? `${a.peso} kg` : "-"}</td>
              <td className="p-2">{a.piquete}</td>
              <td className="p-2">
                {a.status_biologico || "saudável"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
