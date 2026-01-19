"use client";

import { useEffect, useMemo, useState } from "react";

/* =====================
   TIPOS (SAFE)
===================== */

type Alerta = {
  tipo: "critico" | "atencao" | "info";
  titulo: string;
  detalhe: string;
};

type ResumoPastagem = {
  risco_pastagem?: string | null;
  decisao_recomendada?: string | null;
};

type Piquete = {
  status?: string | null;
};

type Gram = {
  nome: string;
  indicacao: string;
  pros: string[];
  cuidados: string[];
  risco: "baixo" | "medio" | "alto";
};

type Geo = { lat: number; lon: number };

/* =====================
   HELPERS SAFE
===================== */

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function badgeColor(r: string) {
  if (r === "ALTO") return "bg-red-600";
  if (r === "MEDIO" || r === "MÉDIO") return "bg-yellow-500";
  return "bg-green-600";
}

/* =====================
   MOTOR DETERMINÍSTICO
===================== */

function recomendarGramineas(clima: any): Gram[] {
  const temp = Number(clima?.temperatura_c ?? 0);

  if (!Number.isFinite(temp) || temp <= 0) {
    return [
      {
        nome: "Brachiaria (Marandu / Paiaguás)",
        indicacao: "Recomendação base segura.",
        pros: ["Robusta", "Alta adaptação"],
        cuidados: ["Ajustar lotação"],
        risco: "baixo",
      },
    ];
  }

  if (temp >= 24) {
    return [
      {
        nome: "Mombaça / Tanzânia",
        indicacao: "Alta produção em clima quente.",
        pros: ["Alta resposta"],
        cuidados: ["Manejo técnico"],
        risco: "medio",
      },
      {
        nome: "Brachiaria (Marandu)",
        indicacao: "Estabilidade do sistema.",
        pros: ["Persistente"],
        cuidados: ["Monitorar seca"],
        risco: "baixo",
      },
    ];
  }

  return [
    {
      nome: "Tifton",
      indicacao: "Clima mais ameno.",
      pros: ["Alta eficiência"],
      cuidados: ["Exige manejo"],
      risco: "medio",
    },
  ];
}

/* =====================
   COMPONENTE
===================== */

export default function UltraBiologicoPastagem(props: {
  resumo?: ResumoPastagem | null;
  piquetes?: Piquete[] | null;
  alertas?: Alerta[] | null;
}) {
  /* 🔒 BLINDAGEM ABSOLUTA */
  const resumo = props.resumo ?? {};
  const piquetes = Array.isArray(props.piquetes) ? props.piquetes : [];
  const alertas = Array.isArray(props.alertas) ? props.alertas : [];

  const risco = String(resumo.risco_pastagem ?? "DESCONHECIDO").toUpperCase();
  const decisao = String(resumo.decisao_recomendada ?? "").toUpperCase();

  const ocupados = piquetes.filter((p) => norm(p.status).includes("ocupado")).length;
  const taxa = piquetes.length ? ocupados / piquetes.length : 0;

  /* GPS + Clima */
  const [geo, setGeo] = useState<Geo | null>(null);
  const [clima, setClima] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recomendadas = useMemo(() => recomendarGramineas(clima), [clima]);

  async function capturarGPS() {
    if (!navigator.geolocation) {
      setErro("Geolocalização não suportada.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setGeo({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setErro("Permissão de GPS negada.")
    );
  }

  async function carregarClima() {
    if (!geo) return;
    try {
      const r = await fetch(`/api/clima?lat=${geo.lat}&lon=${geo.lon}`, { cache: "no-store" });
      if (r.ok) setClima(await r.json());
    } catch {
      setErro("Erro ao obter clima.");
    }
  }

  useEffect(() => {
    if (geo) carregarClima();
  }, [geo]);

  return (
    <section className="mt-6 rounded-2xl border bg-white p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ultra Biológico — Pastagem</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${badgeColor(risco)}`}>
          {risco}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Gestão técnica operacional (Triângulo 360). <b>Não é prescrição.</b>
      </p>

      <div className="mt-4 flex gap-2">
        <button onClick={capturarGPS} className="bg-black text-white px-3 py-2 rounded text-xs">
          Capturar GPS
        </button>
        <button
          onClick={carregarClima}
          disabled={!geo}
          className="bg-green-700 text-white px-3 py-2 rounded text-xs disabled:opacity-50"
        >
          Atualizar Clima
        </button>
      </div>

      {erro && <div className="mt-3 text-sm text-red-600">{erro}</div>}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {recomendadas.map((g) => (
          <div key={g.nome} className="border rounded-xl p-4">
            <b>{g.nome}</b>
            <p className="text-sm mt-1">{g.indicacao}</p>
            <ul className="mt-2 text-xs list-disc pl-4">
              {g.pros.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-sm">Alertas</h3>
          <ul className="mt-2 space-y-2">
            {alertas.map((a, i) => (
              <li key={i} className="border p-3 rounded text-sm">
                <b>{a.titulo}</b>
                <div>{a.detalhe}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
