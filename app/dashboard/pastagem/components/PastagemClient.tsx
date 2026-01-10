"use client";

// app/dashboard/pastagem/components/PastagemClient.tsx
import { useEffect, useMemo, useState } from "react";

type PiqueteRow = {
  piquete_id?: string | number;
  nome?: string;
  area_ha?: number | null;
  status?: string | null;
  capacidade_ua?: number | null;
};

type ApiPastagemResponse = {
  ok: boolean;
  rows: PiqueteRow[];
  count: number;
  error?: string;
};

type ApiAlertasResponse = {
  ok: boolean;
  total: number;
  alertas: Array<{
    tipo: string;
    piquete: string;
    mensagem: string;
  }>;
  error?: string;
};

export default function PastagemClient() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [rows, setRows] = useState<PiqueteRow[]>([]);
  const [alertas, setAlertas] = useState<ApiAlertasResponse["alertas"]>([]);

  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setErro(null);

    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/pastagem", { cache: "no-store" }),
        fetch("/api/pastagem/alertas", { cache: "no-store" }),
      ]);

      const j1 = (await r1.json()) as ApiPastagemResponse;
      const j2 = (await r2.json()) as ApiAlertasResponse;

      if (!j1.ok) throw new Error(j1.error || "Falha ao carregar Pastagem");
      if (!j2.ok) throw new Error(j2.error || "Falha ao carregar Alertas");

      setRows(j1.rows ?? []);
      setAlertas(j2.alertas ?? []);
    } catch (e: any) {
      setErro(e?.message ?? "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const kpis = useMemo(() => {
    const total = rows.length;

    const disponivel = rows.filter((r) => (r.status ?? "").toLowerCase() === "disponivel").length;
    const ocupado = total - disponivel;

    const areaTotal = rows.reduce((acc, r) => acc + (Number(r.area_ha) || 0), 0);
    const capacidadeTotal = rows.reduce((acc, r) => acc + (Number(r.capacidade_ua) || 0), 0);

    return {
      total,
      disponivel,
      ocupado,
      areaTotal,
      capacidadeTotal,
      alertas: alertas.length,
    };
  }, [rows, alertas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const nome = (r.nome ?? "").toLowerCase();
      const status = (r.status ?? "").toLowerCase();
      return nome.includes(q) || status.includes(q);
    });
  }, [rows, search]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Pastagem (Real)</h1>
        <p className="text-sm text-gray-600">
          Monitoramento executivo do uso de piquetes + alertas operacionais (Pecuária Executiva).
        </p>
      </div>

      {erro ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-semibold mb-1">Erro ao carregar Pastagem</div>
          <div className="mb-3">{erro}</div>
          <button
            onClick={load}
            className="rounded-md bg-red-600 px-3 py-2 text-white text-sm hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Piquetes" value={kpis.total} />
        <KpiCard label="Disponíveis" value={kpis.disponivel} />
        <KpiCard label="Ocupados" value={kpis.ocupado} />
        <KpiCard label="Área total (ha)" value={kpis.areaTotal.toFixed(1)} />
        <KpiCard label="Capacidade (UA)" value={kpis.capacidadeTotal.toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de alertas */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Alertas</h2>
                <p className="text-xs text-gray-500">Operacional (campo real)</p>
              </div>
              <span className="text-xs rounded-full bg-gray-100 px-2 py-1">{kpis.alertas}</span>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-sm text-gray-500">Carregando alertas...</div>
              ) : alertas.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhum alerta no momento.</div>
              ) : (
                <ul className="space-y-3">
                  {alertas.map((a, idx) => (
                    <li key={idx} className="rounded-lg border p-3">
                      <div className="text-xs text-gray-500">{a.tipo.toUpperCase()}</div>
                      <div className="font-medium">{a.piquete}</div>
                      <div className="text-sm text-gray-600">{a.mensagem}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border bg-white shadow-sm p-4">
            <h3 className="font-semibold mb-1">Recomendação Executiva</h3>
            <p className="text-sm text-gray-600">
              Se aproximar da seca e houver queda de disponibilidade, iniciar suplementação
              antecipada (proteinado → proteico-energético) e ajustar lotação antes da perda de GMD.
            </p>
          </div>
        </div>

        {/* Lista de piquetes */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">Piquetes</h2>
                <p className="text-xs text-gray-500">
                  Fonte: <code className="text-gray-700">piquete_status_view</code>
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-[420px]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar: nome, status..."
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <button
                  onClick={load}
                  className="rounded-lg bg-black px-3 py-2 text-white text-sm hover:opacity-90"
                >
                  Atualizar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">Área (ha)</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Capacidade (UA)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-4 text-gray-500" colSpan={4}>
                        Carregando pastagem...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-gray-500" colSpan={4}>
                        Nenhum piquete encontrado.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3 font-medium">{p.nome ?? "-"}</td>
                        <td className="px-4 py-3">{(Number(p.area_ha) || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status ?? ""} />
                        </td>
                        <td className="px-4 py-3">{(Number(p.capacidade_ua) || 0).toFixed(1)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t text-xs text-gray-500">
              Decisão de campo: manter rotação, evitar superpastejo e antecipar suplementação na transição águas → seca.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();

  const classes =
    s === "disponivel"
      ? "bg-green-50 text-green-700 border-green-200"
      : s === "ocupado"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${classes}`}>
      {status || "—"}
    </span>
  );
}
