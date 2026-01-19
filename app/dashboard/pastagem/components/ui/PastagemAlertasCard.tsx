"use client";

type Props = { alertas: any[] };

function safe(v: any) {
  if (v === null || v === undefined || v === "") return "";
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

const tipoBadge = (t: string) => {
  if (t === "critico") return "bg-red-100 text-red-800 border-red-200";
  if (t === "atencao") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

export default function PastagemAlertasCard({ alertas }: Props) {
  const rows = Array.isArray(alertas) ? alertas : [];

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-base font-semibold">Alertas</div>

      {rows.length === 0 ? (
        <div className="mt-3 text-sm text-gray-600">Sem alertas no momento.</div>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((a, idx) => (
            <div key={idx} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">{safe(a?.titulo || "Alerta")}</div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${tipoBadge(
                    String(a?.tipo ?? "info")
                  )}`}
                >
                  {String(a?.tipo ?? "info").toUpperCase()}
                </span>
              </div>

              {a?.detalhe ? (
                <div className="mt-2 text-sm text-gray-700">{safe(a.detalhe)}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
