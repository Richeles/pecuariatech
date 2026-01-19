"use client";

type Props = { piquetes: any[] };

function safe(v: any) {
  if (v === null || v === undefined || v === "") return "-";
  if (typeof v === "object") {
    const exec = v?.executivo;
    const op = v?.operacional;
    if (exec || op) return [exec, op].filter(Boolean).join(" • ");
    try {
      return JSON.stringify(v);
    } catch {
      return "[objeto]";
    }
  }
  return String(v);
}

function fmtNum(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return safe(v);
  return n.toLocaleString("pt-BR");
}

export default function PastagemPiquetesTable({ piquetes }: Props) {
  const rows = Array.isArray(piquetes) ? piquetes : [];

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-base font-semibold">Piquetes</div>

      {rows.length === 0 ? (
        <div className="mt-3 text-sm text-gray-600">
          Nenhum piquete retornado pela API.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <Th>Nome</Th>
                <Th>Área (ha)</Th>
                <Th>Tipo</Th>
                <Th>Capacidade (UA)</Th>
                <Th>Status</Th>
                <Th>Últ. movimentação</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr key={String(p?.piquete_id ?? idx)} className="border-t">
                  <Td>{safe(p?.nome)}</Td>
                  <Td>{fmtNum(p?.area_ha)}</Td>
                  <Td>{safe(p?.tipo_pasto)}</Td>
                  <Td>{fmtNum(p?.capacidade_ua)}</Td>
                  <Td>{safe(p?.status)}</Td>
                  <Td>{safe(p?.ultima_movimentacao_em)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Th({ children }: { children: any }) {
  return <th className="px-3 py-2 text-left font-semibold">{children}</th>;
}

function Td({ children }: { children: any }) {
  return <td className="px-3 py-2">{children}</td>;
}
