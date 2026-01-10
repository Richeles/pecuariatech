"use client";

import { useEffect, useMemo, useState } from "react";

type ApiRow = {
  animal_id: string;
  animal_brinco: string | null;
  raca: string | null;
  sexo: string | null;
  peso: number | null;
  status: string | null;
  status_biologico: string | null;
  movimentacao_tipo: string | null;
  movimentacao_local: string | null;
  movimentacao_data_entrada: string | null;
  movimentacao_data_saida: string | null;
};

type AnimalUI = {
  animal_id: string;
  brinco: string;
  raca: string;
  sexo: string;
  peso: number | null;
  status_biologico: string;
  ultima_localizacao: string;
};

export default function RebanhoClient() {
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/rebanho", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.ok && Array.isArray(json?.rows)) setRows(json.rows);
      })
      .finally(() => setLoading(false));
  }, []);

  // consolida 1 linha por animal
  const animals = useMemo<AnimalUI[]>(() => {
    const map = new Map<string, AnimalUI>();

    for (const r of rows) {
      if (!r?.animal_id) continue;

      if (!map.has(r.animal_id)) {
        map.set(r.animal_id, {
          animal_id: r.animal_id,
          brinco: r.animal_brinco ?? "—",
          raca: r.raca ?? "—",
          sexo: r.sexo ?? "—",
          peso: r.peso ?? null,
          status_biologico: r.status_biologico ?? "—",
          ultima_localizacao: r.movimentacao_local ?? "—",
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.brinco.localeCompare(b.brinco)
    );
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return animals;

    return animals.filter((a) => {
      return (
        a.brinco.toLowerCase().includes(term) ||
        a.raca.toLowerCase().includes(term) ||
        a.sexo.toLowerCase().includes(term) ||
        a.status_biologico.toLowerCase().includes(term) ||
        a.ultima_localizacao.toLowerCase().includes(term)
      );
    });
  }, [animals, q]);

  if (loading) return <p className="text-gray-500">Carregando Rebanho real…</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">Total de animais</p>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
        </div>

        <div className="w-full sm:w-[420px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: brinco, raça, sexo, status, localização…"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700">Brinco</th>
              <th className="p-3 text-left font-semibold text-gray-700">Raça</th>
              <th className="p-3 text-left font-semibold text-gray-700">Sexo</th>
              <th className="p-3 text-right font-semibold text-gray-700">Peso (kg)</th>
              <th className="p-3 text-left font-semibold text-gray-700">Status biológico</th>
              <th className="p-3 text-left font-semibold text-gray-700">Última localização</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.animal_id} className="border-t">
                <td className="p-3">{a.brinco}</td>
                <td className="p-3">{a.raca}</td>
                <td className="p-3">{a.sexo}</td>
                <td className="p-3 text-right">{a.peso ?? "—"}</td>
                <td className="p-3">{a.status_biologico}</td>
                <td className="p-3">{a.ultima_localizacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
