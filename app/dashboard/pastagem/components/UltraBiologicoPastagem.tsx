"use client";

import PastagemResumoCard from "./ui/PastagemResumoCard";
import PastagemPiquetesTable from "./ui/PastagemPiquetesTable";
import PastagemAlertasCard from "./ui/PastagemAlertasCard";
import PastagemTriangulo360 from "./ui/PastagemTriangulo360";

type Props = {
  resumo: any;
  piquetes: any[];
  alertas: any[];
};

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

export default function UltraBiologicoPastagem({ resumo, piquetes, alertas }: Props) {
  const risco = safe(resumo?.risco_pastagem ?? "DESCONHECIDO");

  return (
    <div className="p-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Ultra Biológico — Pastagem</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestão técnica operacional (Triângulo 360). <b>Não é prescrição.</b>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border px-3 py-1 text-xs font-semibold">
              RISCO: {risco}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        <PastagemResumoCard resumo={resumo} />
        <PastagemTriangulo360 resumo={resumo} />
        <PastagemAlertasCard alertas={alertas} />
        <PastagemPiquetesTable piquetes={piquetes} />
      </div>
    </div>
  );
}
