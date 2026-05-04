"use client";

import { useEffect, useMemo, useState } from "react";
import RebanhoSanidadePainel from "./RebanhoSanidadePainel";

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
  const [erro, setErro] = useState<string | null>(null);

  // ================= FETCH =================
  useEffect(() => {
    let ativo = true;

    async function load() {
      try {
        const res = await fetch("/api/rebanho", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          if (ativo) setErro("Erro ao carregar dados do rebanho");
          return;
        }

        const json = await res.json().catch(() => null);

        if (!ativo) return;

        if (json?.ok && Array.isArray(json?.rows)) {
          setRows(json.rows);
        } else {
          setRows([]);
        }
      } catch (e) {
        console.error("Erro fetch rebanho:", e);
        if (ativo) setErro("Falha de conexão com o servidor");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    load();

    return () => {
      ativo = false;
    };
  }, []);

  // ================= CONSOLIDAÇÃO =================
  const animals = useMemo<AnimalUI[]>(() => {
    if (!rows?.length) return [];

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

  // ================= FILTRO =================
  const filtered = useMemo(() => {
    if (!q.trim()) return animals;

    const term = q.toLowerCase();

    return animals.filter((a) =>
      [
        a.brinco,
        a.raca,
        a.sexo,
        a.status_biologico,
        a.ultima_localizacao,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [animals, q]);

  // ================= MÉTRICAS =================
  const resumo = useMemo(() => {
    if (!filtered.length) {
      return {
        total: 0,
        semLocalizacao: 0,
        semPeso: 0,
        machos: 0,
        femeas: 0,
        racasTop: [],
      };
    }

    let semLocalizacao = 0;
    let semPeso = 0;
    let machos = 0;
    let femeas = 0;

    const racas = new Map<string, number>();

    for (const a of filtered) {
      if (!a.ultima_localizacao || a.ultima_localizacao === "—") semLocalizacao++;
      if (a.peso == null) semPeso++;

      const sx = a.sexo.toLowerCase();
      if (sx.includes("macho")) machos++;
      if (sx.includes("fêmea") || sx.includes("femea")) femeas++;

      const r = a.raca.trim();
      racas.set(r, (racas.get(r) ?? 0) + 1);
    }

    const racasTop = Array.from(racas.entries())
      .filter(([nome]) => nome && nome !== "—")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nome, qtd]) => ({ nome, qtd }));

    return {
      total: filtered.length,
      semLocalizacao,
      semPeso,
      machos,
      femeas,
      racasTop,
    };
  }, [filtered]);

  // ================= ESTADOS =================

  if (loading) {
    return <p className="text-gray-500">Carregando dados do rebanho...</p>;
  }

  if (erro) {
    return <p className="text-red-500">{erro}</p>;
  }

  if (!rows.length) {
    return (
      <p className="text-gray-500">
        Nenhum animal encontrado. Cadastre ou importe dados para iniciar.
      </p>
    );
  }

  // ================= UI =================

  return (
    <section className="space-y-4">

      {/* Painel estratégico */}
      <RebanhoSanidadePainel
        total={resumo.total}
        semLocalizacao={resumo.semLocalizacao}
        semPeso={resumo.semPeso}
        machos={resumo.machos}
        femeas={resumo.femeas}
        racasTop={resumo.racasTop}
      />

      {/* Header operacional */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">Total de animais</p>
          <p className="text-2xl font-bold text-gray-900">
            {filtered.length}
          </p>
        </div>

        <div className="w-full sm:w-[420px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: brinco, raça, sexo, status, localização..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* Tabela */}
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