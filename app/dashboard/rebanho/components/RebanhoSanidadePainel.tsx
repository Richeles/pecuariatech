"use client";

type Props = {
  total: number;
  semLocalizacao: number;
  semPeso: number;
  machos: number;
  femeas: number;
  racasTop: Array<{ nome: string; qtd: number }>;
};

/**
 * ✅ Painel Sanitário (Tático/Executivo)
 * - Campanhas obrigatórias
 * - Alertas operacionais
 * - Score de conformidade
 *
 * IMPORTANTE:
 * - Não é diagnóstico
 * - Não é prescrição
 * - É conformidade/gestão (apoio ao Vet/Zootecnista)
 */
export default function RebanhoSanidadePainel({
  total,
  semLocalizacao,
  semPeso,
  machos,
  femeas,
  racasTop,
}: Props) {
  const conformidade = total > 0 ? Math.max(0, Math.round(((total - semLocalizacao - semPeso) / total) * 100)) : 0;

  const campanhas = [
    {
      titulo: "Campanha obrigatória — Vacinação (janela atual)",
      status: "ATENÇÃO",
      detalhe:
        "Recomendado registrar execução por lote/categoria (brinco, data, responsável). Gestão sanitária/compliance, sem prescrição.",
    },
    {
      titulo: "Vermifugação estratégica (rotina)",
      status: "INFO",
      detalhe:
        "Controle por categoria e época do ano. Se houver protocolo específico, seguir responsável técnico.",
    },
    {
      titulo: "Medicamentos / suplementos (controle operacional)",
      status: "OK",
      detalhe:
        "Registre lote, brinco, data, insumo e responsável. Isso eleva rastreabilidade e reduz risco operacional.",
    },
  ];

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-base font-semibold">Sanidade & Campanhas (SuperVet • Triângulo 360)</div>
          <p className="mt-1 text-sm text-gray-600">
            Painel de conformidade sanitária e apoio à decisão. <b>Não é prescrição/diagnóstico.</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs font-semibold">
            Conformidade: {conformidade}%
          </span>
        </div>
      </div>

      {/* KPIs executivos */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
        <KPI label="Total" value={fmt(total)} />
        <KPI label="Sem localização" value={fmt(semLocalizacao)} />
        <KPI label="Sem peso" value={fmt(semPeso)} />
        <KPI label="Machos" value={fmt(machos)} />
        <KPI label="Fêmeas" value={fmt(femeas)} />
        <KPI label="Raça líder" value={racasTop?.[0]?.nome ? `${racasTop[0].nome} (${fmt(racasTop[0].qtd)})` : "—"} />
      </div>

      {/* Campanhas */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold">Campanhas (obrigatórias e rotina)</div>
          <div className="mt-3 space-y-3">
            {campanhas.map((c, idx) => (
              <div key={idx} className="rounded-xl border bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{c.titulo}</div>
                  <Badge status={c.status} />
                </div>
                <p className="mt-2 text-sm text-gray-700">{c.detalhe}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm font-semibold">Alertas operacionais</div>
          <div className="mt-3 space-y-3">
            <Alerta
              tipo={semLocalizacao > 0 ? "ATENÇÃO" : "OK"}
              titulo="Rastreabilidade (última localização)"
              detalhe={
                semLocalizacao > 0
                  ? `Há ${fmt(semLocalizacao)} animal(is) sem localização registrada. Completar brinco → lote → piquete.`
                  : "Sem pendências detectadas."
              }
            />
            <Alerta
              tipo={semPeso > 0 ? "ATENÇÃO" : "OK"}
              titulo="Pesagem / dados zootécnicos"
              detalhe={
                semPeso > 0
                  ? `Há ${fmt(semPeso)} animal(is) sem peso registrado. Recomenda-se rotina de pesagem (gestão).`
                  : "Sem pendências detectadas."
              }
            />
            <Alerta
              tipo="INFO"
              titulo="Responsável técnico"
              detalhe="Para diagnóstico, dose, protocolos e conduta clínica: seguir veterinário/responsável técnico."
            />
          </div>
        </div>
      </div>

      {/* Rodapé compliance */}
      <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
        <b>Nota:</b> este painel organiza campanhas e controle sanitário (compliance). Não substitui atendimento veterinário.
      </div>
    </section>
  );
}

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString("pt-BR") : "0";
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const cls =
    status === "OK"
      ? "bg-green-100 text-green-800 border-green-200"
      : status === "ATENÇÃO"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-gray-100 text-gray-800 border-gray-200";

  return <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>{status}</span>;
}

function Alerta({ tipo, titulo, detalhe }: { tipo: "OK" | "ATENÇÃO" | "INFO"; titulo: string; detalhe: string }) {
  const cls =
    tipo === "OK"
      ? "bg-green-50 border-green-200 text-green-900"
      : tipo === "ATENÇÃO"
      ? "bg-yellow-50 border-yellow-200 text-yellow-900"
      : "bg-gray-50 border-gray-200 text-gray-900";

  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="text-sm font-semibold">{titulo}</div>
      <div className="mt-1 text-sm">{detalhe}</div>
    </div>
  );
}
