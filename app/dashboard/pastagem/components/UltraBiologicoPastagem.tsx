"use client";

import { useEffect, useMemo, useState } from "react";

type Alerta = {
  tipo: "critico" | "atencao" | "info";
  titulo: string;
  detalhe: string;
};

type ResumoPastagem = {
  escopo?: string | null;
  qtd_piquetes?: number | null;
  area_total_ha?: number | null;
  area_ativa_ha?: number | null;
  animais_total?: number | null;
  ua_total?: number | null;
  ua_por_ha_atual?: number | null;
  ua_por_ha_suportada?: number | null;
  ua_suportada_ativa?: number | null;
  pressao_pastagem_score?: number | null;
  risco_pastagem?: string | null;
  decisao_recomendada?: string | null;
  ultima_movimentacao_em?: string | null;
};

type Piquete = {
  piquete_id?: string | null;
  nome?: string | null;
  area_ha?: number | null;
  tipo_pasto?: string | null;
  capacidade_ua?: number | null;
  status?: string | null;
  ultima_movimentacao_em?: string | null;
};

type Gram = {
  nome: string;
  indicacao: string;
  prós: string[];
  cuidados: string[];
  risco: "baixo" | "medio" | "alto";
};

type Geo = { lat: number; lon: number };

/**
 * ✅ ULTRA BIOLÓGICO — Pastagem
 * - recomendação por clima + GPS
 * - motor determinístico (não quebra)
 * - preparado para futuro: alertas El Niño/La Niña via job externo
 *
 * IMPORTANTE:
 * - Não é prescrição
 * - Não é laudo
 * - Gestão técnica operacional (Triângulo 360)
 */

function norm(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function badgeColorRisco(risco: string) {
  const r = String(risco ?? "").toUpperCase();
  if (r === "ALTO") return "bg-red-600";
  if (r === "MEDIO" || r === "MÉDIO") return "bg-yellow-500";
  return "bg-green-600";
}

function badgeColorMini(risco: "baixo" | "medio" | "alto") {
  if (risco === "alto") return "bg-red-600";
  if (risco === "medio") return "bg-yellow-500";
  return "bg-green-600";
}

/**
 * Motor seguro de recomendação de gramíneas.
 * Entrada: clima básico (temperatura média + condição)
 * Saída: lista de recomendações.
 *
 * ✅ Robustez:
 * - se clima não existir: fallback genérico
 */
function recomendarGramineas(clima: any): Gram[] {
  const temp = Number(clima?.temperatura_c ?? clima?.temp_c ?? clima?.temp ?? 0);
  const cond = norm(clima?.condicao ?? clima?.condition ?? clima?.descricao ?? "");
  const chuva = norm(clima?.chuva ?? clima?.rain ?? clima?.precipitacao ?? "");
  const umido = cond.includes("chuva") || cond.includes("storm") || chuva.includes("sim");
  const seco = cond.includes("seca") || cond.includes("dry");

  // fallback (não quebra)
  if (!Number.isFinite(temp) || temp <= 0) {
    return [
      {
        nome: "Brachiaria (Marandu / Paiaguás)",
        indicacao: "Recomendação base (robusta) para grande parte do Brasil.",
        prós: ["Boa adaptação", "Boa persistência", "Fácil manejo"],
        cuidados: ["Ajustar lotação na seca", "Rotação e descanso"],
        risco: "baixo",
      },
      {
        nome: "Mombaça / Tanzânia",
        indicacao: "Alta produção em sistemas mais intensivos.",
        prós: ["Alta resposta", "Boa produção de MS"],
        cuidados: ["Exige manejo mais técnico", "Sensível a superpastejo"],
        risco: "medio",
      },
    ];
  }

  // quente + úmido → Panicum
  if (temp >= 24 && umido && !seco) {
    return [
      {
        nome: "Mombaça (Panicum)",
        indicacao: "Quente/úmido: alta produção para intensificação.",
        prós: ["Altíssima produtividade", "Ótimo potencial de GMD"],
        cuidados: ["Rotação rigorosa", "Evitar pastejo muito baixo"],
        risco: "medio",
      },
      {
        nome: "Tanzânia (Panicum)",
        indicacao: "Quente/úmido: bom equilíbrio produtividade/manejo.",
        prós: ["Boa produção", "Boa qualidade"],
        cuidados: ["Requer controle de entrada/saída", "Ajustar lotação"],
        risco: "medio",
      },
      {
        nome: "Brachiaria (Marandu)",
        indicacao: "Opção robusta para estabilidade do sistema.",
        prós: ["Resistente", "Estável ao longo do ano"],
        cuidados: ["Monitorar na seca prolongada"],
        risco: "baixo",
      },
    ];
  }

  // quente + seco → Brachiarias resilientes
  if (temp >= 24 && (seco || !umido)) {
    return [
      {
        nome: "Brachiaria (Paiaguás / Marandu)",
        indicacao: "Quente com seca: foco em persistência e segurança.",
        prós: ["Tolerância maior à seca", "Boa estabilidade"],
        cuidados: ["Descanso estratégico na seca", "Evitar pressão alta"],
        risco: "baixo",
      },
      {
        nome: "Andropogon (onde aplicável)",
        indicacao: "Sistemas extensivos e ambientes mais limitantes.",
        prós: ["Muito rústico", "Baixa exigência"],
        cuidados: ["Qualidade pode cair na seca", "Planejar suplementação"],
        risco: "medio",
      },
    ];
  }

  // ameno → Tifton e brachiaria base
  if (temp < 24) {
    return [
      {
        nome: "Tifton (Cynodon)",
        indicacao: "Ameno: muito bom para manejo intensivo/irrigação.",
        prós: ["Alta resposta a manejo", "Excelente para pastejo rotacionado"],
        cuidados: ["Exige manejo", "Adubação e/ou irrigação aumentam retorno"],
        risco: "medio",
      },
      {
        nome: "Brachiaria (Marandu)",
        indicacao: "Base robusta para estabilidade.",
        prós: ["Boa adaptação", "Boa persistência"],
        cuidados: ["Rotação e descanso"],
        risco: "baixo",
      },
    ];
  }

  // default
  return [
    {
      nome: "Brachiaria (Marandu / Paiaguás)",
      indicacao: "Recomendação segura padrão.",
      prós: ["Estável", "Robusta"],
      cuidados: ["Manejo de lotação na seca"],
      risco: "baixo",
    },
  ];
}

/**
 * Banco comunitário regional (safe).
 * Nesta etapa final, armazenamos no LocalStorage para NÃO arriscar quebra.
 * Depois evolui para Supabase (view âncora de recomendações regionais).
 */
const LS_KEY = "pecuariatech_pastagem_variedades_v1";

function loadLS(): any[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveLS(items: any[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // se falhar não quebra o SaaS
  }
}

export default function UltraBiologicoPastagem(props: {
  resumo: ResumoPastagem | null;
  piquetes: Piquete[];
  alertas: Alerta[];
}) {
  const { resumo, piquetes, alertas } = props;

  const risco = String(resumo?.risco_pastagem ?? "DESCONHECIDO").toUpperCase();
  const decisao = String(resumo?.decisao_recomendada ?? "").toUpperCase();

  const ocupados = piquetes.filter((p) => {
    const s = norm(p.status);
    return s.includes("ocupado") || s.includes("em_uso");
  }).length;

  const total = piquetes.length;
  const taxa = total > 0 ? ocupados / total : 0;

  // GPS + clima
  const [geo, setGeo] = useState<Geo | null>(null);
  const [clima, setClima] = useState<any>(null);
  const [climaErr, setClimaErr] = useState<string | null>(null);
  const [loadingClima, setLoadingClima] = useState(false);

  // comunitário (regional)
  const [varNome, setVarNome] = useState("");
  const [varObs, setVarObs] = useState("");
  const [varRegiao, setVarRegiao] = useState("");
  const [banco, setBanco] = useState<any[]>([]);

  useEffect(() => {
    // carregar banco local safe
    setBanco(loadLS());
  }, []);

  const recomendadas = useMemo(() => {
    return recomendarGramineas(clima);
  }, [clima]);

  // especialistas
  const vet = useMemo(() => {
    if (risco === "ALTO") {
      return {
        titulo: "Veterinário (Risco Operacional)",
        itens: [
          "Aumentar ronda (locomoção, estresse térmico, ingestão).",
          "Prioridade água: acesso, vazão e limpeza.",
          "Registrar intercorrências (evento → rastreabilidade).",
        ],
      };
    }
    return {
      titulo: "Veterinário (Risco Operacional)",
      itens: ["Checklist semanal: água/sombra/acesso.", "Registrar movimentações e ocorrências."],
    };
  }, [risco]);

  const zoo = useMemo(() => {
    if (taxa >= 0.8 || decisao.includes("REDUZIR")) {
      return {
        titulo: "Zootecnista (Eficiência de Lotação)",
        itens: [
          "Lotação alta: revisar UA/ha vs suportada.",
          "Ajustar rotação e descanso para evitar superpastejo.",
          "Revisar metas: GMD x pressão de pastejo.",
        ],
      };
    }
    return {
      titulo: "Zootecnista (Eficiência de Lotação)",
      itens: ["Manter rotação planejada.", "Ajustar lotação de forma gradual."],
    };
  }, [taxa, decisao]);

  const pasto = useMemo(() => {
    if (risco === "ALTO" || decisao.includes("REGULARIZAR") || decisao.includes("REVISAR")) {
      return {
        titulo: "Especialista de Pastagem (Manejo)",
        itens: [
          "Regularizar área ativa/cadastro (área/forrageira/capacidade).",
          "Definir descanso e altura mínima de entrada/saída.",
          "Não aumentar lotação antes de estabilizar manejo.",
        ],
      };
    }
    return {
      titulo: "Especialista de Pastagem (Manejo)",
      itens: ["Manter calendário de descanso.", "Revisar capacidade conforme estação."],
    };
  }, [risco, decisao]);

  async function captarLocalizacao() {
    setClimaErr(null);

    if (!navigator.geolocation) {
      setClimaErr("Geolocalização não suportada neste navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setClimaErr("Não foi possível obter GPS (permissão negada ou indisponível).");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  async function carregarClima() {
    if (!geo) return;

    try {
      setLoadingClima(true);
      setClimaErr(null);

      // ✅ usa API interna já existente (não dependemos de serviços externos diretamente)
      const url = `/api/clima?lat=${geo.lat}&lon=${geo.lon}&ts=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        setClimaErr(`Falha ao obter clima (HTTP ${res.status}).`);
        return;
      }

      const json = await res.json();
      setClima(json);
    } catch (e: any) {
      setClimaErr(e?.message ?? "Erro inesperado ao obter clima.");
    } finally {
      setLoadingClima(false);
    }
  }

  useEffect(() => {
    if (geo) carregarClima();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo?.lat, geo?.lon]);

  function registrarVariedade() {
    const nome = varNome.trim();
    const regiao = varRegiao.trim();
    if (!nome || !regiao) return;

    const item = {
      id: `${Date.now()}`,
      nome,
      regiao,
      obs: varObs.trim(),
      criado_em: new Date().toISOString(),
      votos: 1,
    };

    const next = [item, ...banco];
    setBanco(next);
    saveLS(next);

    setVarNome("");
    setVarObs("");
  }

  function votar(itemId: string) {
    const next = banco.map((x) => {
      if (x.id === itemId) return { ...x, votos: Number(x.votos ?? 0) + 1 };
      return x;
    });
    setBanco(next);
    saveLS(next);
  }

  const aprendizado = [
    "Motor evolutivo: mais dados (manejo+clima+resultado) → melhor recomendação.",
    "A recomendação não é prescrição: é gestão de risco e decisão operacional.",
    "Futuro: alertas El Niño/La Niña entram via job oficial (sem quebrar SaaS).",
  ];

  return (
    <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">Ultra Biológico — Pastagem</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Risco</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${badgeColorRisco(risco)}`}>
            {risco}
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Camada técnica (Triângulo 360): agronômico + zootécnico + risco climático.
        <b> Não é laudo nem prescrição</b>.
      </p>

      {/* Especialistas */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card titulo={vet.titulo} itens={vet.itens} />
        <Card titulo={zoo.titulo} itens={zoo.itens} />
        <Card titulo={pasto.titulo} itens={pasto.itens} />
      </div>

      {/* GPS + Clima */}
      <div className="mt-6 rounded-2xl border bg-gray-50 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-semibold">GPS + Clima da Região</h3>
          <div className="flex gap-2">
            <button
              onClick={captarLocalizacao}
              className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
            >
              Capturar GPS
            </button>
            <button
              onClick={carregarClima}
              disabled={!geo || loadingClima}
              className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {loadingClima ? "Carregando..." : "Atualizar Clima"}
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <MiniInfo label="Localização" value={geo ? `${geo.lat.toFixed(4)}, ${geo.lon.toFixed(4)}` : "não definida"} />
          <MiniInfo label="Temperatura" value={clima?.temperatura_c ?? clima?.temp_c ?? "-"} />
          <MiniInfo label="Condição" value={clima?.condicao ?? clima?.condition ?? clima?.descricao ?? "-"} />
        </div>

        {climaErr ? (
          <div className="mt-3 rounded-lg border bg-white p-3 text-sm">
            <b>Alerta:</b> {climaErr}
          </div>
        ) : null}
      </div>

      {/* Recomendação de gramíneas */}
      <div className="mt-6 rounded-2xl border bg-white p-4">
        <h3 className="text-sm font-semibold">Gramíneas sugeridas para sua região (clima + GPS)</h3>
        <p className="mt-1 text-xs text-gray-600">
          Motor seguro (determinístico). Evolui com dados comunitários e resultados reais.
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {recomendadas.map((g) => (
            <div key={g.nome} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <b className="text-sm">{g.nome}</b>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold text-white ${badgeColorMini(g.risco)}`}>
                  risco {g.risco}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-700">{g.indicacao}</p>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div>
                  <div className="text-[11px] font-semibold text-gray-600">Prós</div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-gray-700">
                    {g.prós.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-600">Cuidados</div>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-gray-700">
                    {g.cuidados.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banco comunitário regional */}
      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-semibold">Banco Regional (comunitário) — Variedades que funcionaram</h3>
          <span className="text-[11px] text-gray-600">
            Modo Safe (LocalStorage). Evolui depois para Supabase sem quebrar.
          </span>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <MiniInput label="Região (ex: Sul do Pará / MT Norte)" value={varRegiao} setValue={setVarRegiao} />
          <MiniInput label="Variedade / cultivar" value={varNome} setValue={setVarNome} />
          <MiniInput label="Observação (resultado, manejo, seca, adubo)" value={varObs} setValue={setVarObs} />
        </div>

        <button
          onClick={registrarVariedade}
          className="mt-3 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white"
        >
          Cadastrar variedade testada
        </button>

        {/* Lista */}
        <div className="mt-4 space-y-2">
          {!banco.length ? (
            <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
              Nenhuma variedade cadastrada ainda.
            </div>
          ) : (
            banco.map((x) => (
              <div key={x.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <b className="text-sm">{x.nome}</b>
                    <div className="text-xs text-gray-600">Região: {x.regiao}</div>
                  </div>
                  <button
                    onClick={() => votar(x.id)}
                    className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
                  >
                    👍 Útil ({x.votos ?? 0})
                  </button>
                </div>
                {x.obs ? <div className="mt-2 text-xs text-gray-700">{x.obs}</div> : null}
                <div className="mt-2 text-[11px] text-gray-500">
                  Cadastrado em: {String(x.criado_em ?? "").slice(0, 10)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Aprendizado contínuo */}
      <div className="mt-6 rounded-xl bg-gray-50 p-4">
        <h3 className="text-sm font-semibold">Aprendizado Contínuo (nunca quebra)</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
          {aprendizado.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>

        {alertas?.length ? (
          <div className="mt-4">
            <h4 className="text-sm font-semibold">Alertas do Motor</h4>
            <ul className="mt-2 space-y-2">
              {alertas.map((a, idx) => (
                <li key={idx} className="rounded-lg border bg-white p-3 text-sm">
                  <b className="block">{a.titulo}</b>
                  <span className="text-gray-700">{a.detalhe}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* UI helpers */

function Card(props: { titulo: string; itens: string[] }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold">{props.titulo}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
        {props.itens.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function MiniInfo(props: { label: string; value: any }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-[11px] font-semibold text-gray-600">{props.label}</div>
      <div className="mt-1 text-sm font-semibold">{String(props.value ?? "-")}</div>
    </div>
  );
}

function MiniInput(props: { label: string; value: string; setValue: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-gray-600">{props.label}</div>
      <input
        value={props.value}
        onChange={(e) => props.setValue(e.target.value)}
        className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none"
        placeholder="..."
      />
    </label>
  );
}
