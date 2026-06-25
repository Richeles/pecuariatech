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
    <section className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6 shadow-xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#34D399]">🏥</span> Sanidade & Campanhas
            <span className="text-xs text-[#A7F3D0]/40 font-normal">(SuperVet • Triângulo 360)</span>
          </div>
          <p className="mt-1 text-sm text-[#A7F3D0]/60">
            Painel de conformidade sanitária e apoio à decisão. <b className="text-[#A7F3D0]/80">Não é prescrição/diagnóstico.</b>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#34D399]/20 bg-[#34D399]/10 px-4 py-1.5 text-xs font-bold text-[#34D399]">
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

      {/* Campanhas e Alertas */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#34D399]/10 bg-[#0F2A1A]/40 p-4 backdrop-blur-sm">
          <div className="text-sm font-bold text-white">Campanhas (obrigatórias e rotina)</div>
          <div className="mt-3 space-y-3">
            {campanhas.map((c, idx) => (
              <div key={idx} className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-white">{c.titulo}</div>
                  <Badge status={c.status} />
                </div>
                <p className="mt-2 text-sm text-[#A7F3D0]/70">{c.detalhe}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#34D399]/10 bg-[#0F2A1A]/40 p-4 backdrop-blur-sm">
          <div className="text-sm font-bold text-white">Alertas operacionais</div>
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
      <div className="mt-4 rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/30 p-4 text-sm text-[#A7F3D0]/60">
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
    <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/50 p-3 backdrop-blur-sm">
      <div className="text-xs font-semibold text-[#A7F3D0]/50">{label}</div>
      <div className="mt-1 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const cls =
    status === "OK"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : status === "ATENÇÃO"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";

  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>{status}</span>;
}

function Alerta({ tipo, titulo, detalhe }: { tipo: "OK" | "ATENÇÃO" | "INFO"; titulo: string; detalhe: string }) {
  const cls =
    tipo === "OK"
      ? "border-green-500/20 bg-green-500/5 text-green-400"
      : tipo === "ATENÇÃO"
      ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
      : "border-blue-500/20 bg-blue-500/5 text-blue-400";

  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="text-sm font-semibold text-white">{titulo}</div>
      <div className="mt-1 text-sm text-[#A7F3D0]/70">{detalhe}</div>
    </div>
  );
}