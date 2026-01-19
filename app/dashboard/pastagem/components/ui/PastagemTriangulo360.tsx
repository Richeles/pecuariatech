"use client";

type Props = { resumo: any };

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

export default function PastagemTriangulo360({ resumo }: Props) {
  const risco = safe(resumo?.risco_pastagem ?? "DESCONHECIDO");
  const pressao = safe(resumo?.pressao_pastagem_score ?? "-");

  const operacional = safe(resumo?.decisao_recomendada ?? "Sem ação operacional no momento.");
  const tatico = "Rotação, pressão de pastejo, ajuste de lotação e recuperação da área ativa.";
  const executivo = `Risco: ${risco} | Pressão: ${pressao}`;

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-base font-semibold">Triângulo 360</div>
      <p className="mt-1 text-sm text-gray-600">Gestão operacional/tática/executiva (sem prescrição).</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Box title="Operacional" text={operacional} />
        <Box title="Tático" text={tatico} />
        <Box title="Executivo" text={executivo} />
      </div>
    </section>
  );
}

function Box({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <div className="text-xs font-semibold text-gray-700">{title}</div>
      <div className="mt-2 text-sm text-gray-900">{text}</div>
    </div>
  );
}
