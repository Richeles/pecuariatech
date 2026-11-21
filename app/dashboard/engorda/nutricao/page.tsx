"use client";

import { useEffect, useState } from "react";

/* =====================================================
   TIPOS — CONTRATO DAS APIs DE NUTRIÇÃO
===================================================== */

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type NutricaoItem = {
  id: string;
  nome: string;
  tipo: string;
  marca?: string | null;
  unidade_medida: string;
  custo_unitario_rs?: number | string | null;
  pb_percent?: number | string | null;
  ndt_percent?: number | string | null;
  energia_mcal_kg?: number | string | null;
  observacao?: string | null;
  ativo?: boolean;
};

type NutricaoAplicacao = {
  id: string;
  item_id: string;
  item_nome?: string | null;
  animal_id?: string | null;
  piquete_id?: string | null;
  dose_dia: number | string;
  unidade_dose: string;
  data_inicio: string;
  data_fim?: string | null;
  observacao?: string | null;
  ativo?: boolean;
};

type NutricaoCustoLinha = {
  aplicacao_id: string;
  item_nome: string;
  calculavel: boolean;
  motivo_pendencia: string | null;
  custo_nutricao_rs_dia: number | string | null;
};

type NutricaoResumo = {
  total?: number | string | null;
  custo_nutricao_rs_dia?: number | string | null;
  total_parcial_calculado?: number | string | null;
  calculo_completo?: boolean;
  aplicacoes_total?: number;
  aplicacoes_calculadas?: number;
  aplicacoes_pendentes?: number;
  limite_atingido?: boolean;
  rows?: NutricaoCustoLinha[];
};

type DadosNutricionais = {
  itens: NutricaoItem[];
  aplicacoes: NutricaoAplicacao[];
  custoDia: NutricaoResumo;
};

/* =====================================================
   HELPERS
===================================================== */

function numeroOuNull(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
}

function moedaBRL(valor: number | null): string {
  if (valor === null) {
    return "Não disponível";
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarNumero(valor: unknown): string {
  const numero = numeroOuNull(valor);

  if (numero === null) {
    return "—";
  }

  return numero.toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

function formatarPercentual(valor: unknown): string {
  const numero = numeroOuNull(valor);

  return numero === null
    ? "—"
    : numero.toLocaleString("pt-BR", {
        maximumFractionDigits: 2,
      }) + "%";
}

function formatarData(valor?: string | null): string {
  if (!valor) {
    return "—";
  }

  const partes = valor.split("-");

  if (
    partes.length === 3 &&
    partes.every((parte) => /^\d+$/.test(parte))
  ) {
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "—";
  }

  return data.toLocaleDateString("pt-BR");
}

function nomeTipo(tipo: string): string {
  return tipo
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

/* =====================================================
   CLIENTE HTTP — SESSÃO POR COOKIE DO NAVEGADOR
===================================================== */

async function buscarApi<T>(
  caminho: string,
  signal: AbortSignal
): Promise<T> {
  const response = await fetch(caminho, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  const body = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | null;

  if (!response.ok) {
    const mensagem =
      body?.error ||
      "Falha na consulta da API. HTTP " + response.status;

    throw new Error(mensagem);
  }

  if (!body || body.ok !== true || body.data === undefined) {
    throw new Error(
      body?.error || "Resposta da API fora do contrato esperado."
    );
  }

  return body.data;
}

/* =====================================================
   DASHBOARD
===================================================== */

export default function NutricaoDashboard() {
  const [itens, setItens] = useState<NutricaoItem[]>([]);
  const [aplicacoes, setAplicacoes] = useState<NutricaoAplicacao[]>([]);
  const [custoDia, setCustoDia] = useState<NutricaoResumo>({});

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [recarregar, setRecarregar] = useState(0);

  const [perguntaNura, setPerguntaNura] = useState("");
  const [respostaNura, setRespostaNura] = useState("");
  const [erroNura, setErroNura] = useState<string | null>(null);
  const [consultandoNura, setConsultandoNura] = useState(false);
  const [metaNura, setMetaNura] = useState<{
    fonte?: string;
    rag_ativado?: boolean;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarDados() {
      setCarregando(true);
      setErro(null);

      try {
        const [itensApi, aplicacoesApi, custoApi] = await Promise.all([
          buscarApi<NutricaoItem[]>(
            "/api/nutricao/itens?ativo=true",
            controller.signal
          ),
          buscarApi<NutricaoAplicacao[]>(
            "/api/nutricao/aplicacoes?ativo=true&limit=500",
            controller.signal
          ),
          buscarApi<NutricaoResumo>(
            "/api/nutricao/custo-dia",
            controller.signal
          ),
        ]);

        if (!Array.isArray(itensApi)) {
          throw new Error("A API de itens não retornou uma lista válida.");
        }

        if (!Array.isArray(aplicacoesApi)) {
          throw new Error(
            "A API de aplicações não retornou uma lista válida."
          );
        }

        setItens(itensApi);
        setAplicacoes(aplicacoesApi);
        setCustoDia(custoApi || {});
      } catch (erroConsulta) {
        if (
          erroConsulta instanceof DOMException &&
          erroConsulta.name === "AbortError"
        ) {
          return;
        }

        setErro(
          erroConsulta instanceof Error
            ? erroConsulta.message
            : "Não foi possível carregar os dados nutricionais."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    void carregarDados();

    return () => controller.abort();
  }, [recarregar]);

  const custoCalculado = numeroOuNull(
    custoDia.custo_nutricao_rs_dia ?? custoDia.total
  );

  const custoParcial = numeroOuNull(
    custoDia.total_parcial_calculado
  );

  const totalAplicacoes =
    numeroOuNull(custoDia.aplicacoes_total) ?? aplicacoes.length;

  const semAplicacoes = totalAplicacoes === 0;

  const pendencias = (custoDia.rows ?? []).filter(
    (linha) => !linha.calculavel && Boolean(linha.motivo_pendencia)
  );

  const quantidadePendentes =
    numeroOuNull(custoDia.aplicacoes_pendentes) ?? pendencias.length;

  const calculoCompleto =
    !semAplicacoes &&
    custoDia.calculo_completo === true &&
    custoCalculado !== null;

  const custoExibido = semAplicacoes
    ? "Sem aplicações"
    : calculoCompleto
      ? moedaBRL(custoCalculado)
      : custoDia.calculo_completo === false
        ? "Incompleto"
        : "Não calculado";

  async function consultarNura() {
    const pergunta = perguntaNura.trim();

    if (!pergunta || consultandoNura) return;

    setConsultandoNura(true);
    setErroNura(null);
    setRespostaNura("");
    setMetaNura(null);

    try {
      // Contexto limitado aos registros efetivamente carregados
      // pelas APIs atuais de Nutrição.
      const contexto = {
        catalogo_total: itens.length,
        catalogo_consultado: itens.length,
        itens: itens.slice(0, 60).map((item) => ({
          nome: item.nome,
          tipo: item.tipo,
          marca: item.marca ?? null,
          unidade_medida: item.unidade_medida,
          custo_unitario_rs: item.custo_unitario_rs ?? null,
          pb_percent: item.pb_percent ?? null,
          ndt_percent: item.ndt_percent ?? null,
          energia_mcal_kg: item.energia_mcal_kg ?? null,
        })),

        aplicacoes_total: aplicacoes.length,
        aplicacoes_consultadas: Math.min(aplicacoes.length, 60),
        aplicacoes: aplicacoes.slice(0, 60).map((aplicacao) => ({
          item: aplicacao.item_nome ?? "Não identificado",
          alvo: aplicacao.animal_id
            ? "Animal"
            : aplicacao.piquete_id
              ? "Piquete"
              : "Não identificado",
          dose_dia: aplicacao.dose_dia,
          unidade_dose: aplicacao.unidade_dose,
          data_inicio: aplicacao.data_inicio,
          data_fim: aplicacao.data_fim ?? null,
        })),

        custo_nutricional: {
          calculo_completo: calculoCompleto,
          total_diario: calculoCompleto ? custoCalculado : null,
          parcial: custoParcial,
          aplicacoes_total: custoDia.aplicacoes_total ?? aplicacoes.length,
          aplicacoes_pendentes: custoDia.aplicacoes_pendentes ?? null,
        },
      };

      const contextoTexto = [
        "CONTEXTO OPERACIONAL DA NUTRIÇÃO PECUARIATECH:",
        JSON.stringify(contexto),

        "INSTRUÇÕES TÉCNICAS:",
        "Atue como assistente técnico de apoio à nutrição de bovinos.",
        "Use os registros fornecidos como contexto, sem presumir que estejam completos.",
        "Diferencie dados registrados, hipóteses e sugestões.",
        "Não invente peso, GMD, consumo, composição de alimentos ou custos.",
        "A página não fornece automaticamente peso, GMD ou análise bromatológica completa dos lotes.",
        "Não prescreva dosagens de medicamentos, tratamentos, diagnósticos ou suplementação individual como se fosse profissional habilitado.",
        "Não indique quantidades exatas de minerais ou suplementos sem dados suficientes e avaliação técnica.",
        "Quando faltarem dados, diga quais informações precisam ser cadastradas ou medidas.",
        "Não invente estudos, autores, artigos, DOI ou fontes científicas.",
        "Quando não houver referência verificável nesta consulta, informe claramente que a fonte científica não foi verificada.",
        "Oriente o pecuarista de maneira prática, organizada e em português brasileiro.",
        "As orientações não substituem avaliação de zootecnista ou médico-veterinário.",

        "PERGUNTA DO PECUARISTA:",
        pergunta,
      ].join("\n\n");

      const response = await fetch("/api/nura", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          pergunta: contextoTexto,
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok || typeof body?.resposta !== "string") {
        throw new Error(
          body?.error ||
          "Não foi possível obter orientação do NURA."
        );
      }

      setRespostaNura(body.resposta);
      setMetaNura(body.metadata ?? null);
    } catch (error) {
      setErroNura(
        error instanceof Error
          ? error.message
          : "Falha na consulta ao NURA."
      );
    } finally {
      setConsultandoNura(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-8">
      {/* CABEÇALHO */}

      <section className="overflow-hidden rounded-3xl border border-[#dbe7de] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#173222] via-[#204631] to-[#28553b] px-6 py-9 text-white sm:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest">
                Engorda · Nutrição
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Nutrição Estratégica
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-green-100/90">
                Gestão de insumos, aplicações nutricionais e acompanhamento
                dos custos calculados a partir dos registros da propriedade.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRecarregar((atual) => atual + 1)}
              disabled={carregando}
              className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {carregando ? "Atualizando..." : "Atualizar dados"}
            </button>
          </div>
        </div>
      </section>

      {/* ERRO DE CONSULTA */}

      {erro && (
        <section
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <h2 className="font-bold text-red-800">
            Não foi possível carregar os dados nutricionais
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-red-700">
            {erro}
          </p>

          <button
            type="button"
            onClick={() => setRecarregar((atual) => atual + 1)}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </section>
      )}

      {/* CARREGAMENTO */}

      {carregando && (
        <section
          role="status"
          className="rounded-2xl border border-[#dbe7de] bg-white p-6 text-sm text-[#557564]"
        >
          Consultando os registros nutricionais da propriedade...
        </section>
      )}

      {/* INDICADORES */}

      <section className="grid gap-5 md:grid-cols-3">
        <KpiCard
          title="Itens nutricionais"
          value={carregando ? "—" : itens.length}
          insight="Insumos cadastrados e retornados pela API."
        />

        <KpiCard
          title="Aplicações ativas"
          value={carregando ? "—" : totalAplicacoes}
          insight="Total informado pelo cálculo de custo diário."
        />

        <KpiCard
          title="Custo nutricional diário"
          value={carregando ? "—" : custoExibido}
          insight={
            calculoCompleto
              ? "Total consolidado com cálculo completo."
              : "O total só é apresentado quando todas as aplicações podem ser calculadas."
          }
        />
      </section>

      {/* CUSTO PARCIAL E PENDÊNCIAS */}

      {!carregando && !erro && semAplicacoes && (
        <section className="rounded-2xl border border-[#dbe7de] bg-white p-6">
          <h2 className="font-bold text-[#173222]">
            Nenhuma aplicação nutricional ativa
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#557564]">
            Não existem aplicações ativas registradas para consolidar o custo
            nutricional diário. Isso não representa uma confirmação de custo
            operacional zero.
          </p>
        </section>
      )}

      {!carregando && !erro && !semAplicacoes && !calculoCompleto && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-amber-900">
            Cálculo diário não consolidado
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Existem dados insuficientes ou incompatibilidades que impedem
            apresentar um custo diário total confiável.
          </p>

          {custoParcial !== null && (
            <p className="mt-3 text-sm font-semibold text-amber-900">
              Parcial calculado: {moedaBRL(custoParcial)}
            </p>
          )}

          {quantidadePendentes > 0 && (
            <p className="mt-3 text-sm font-semibold text-amber-900">
              Aplicações pendentes: {quantidadePendentes}
            </p>
          )}

          {pendencias.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                Motivos identificados pela API
              </p>

              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-800">
                {pendencias.map((linha) => (
                  <li key={linha.aplicacao_id}>
                    <strong>{linha.item_nome}:</strong>{" "}
                    {linha.motivo_pendencia}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {custoDia.limite_atingido && (
            <p className="mt-4 text-sm font-semibold text-amber-900">
              O limite de consulta foi atingido. Existem registros adicionais
              que não entraram nesta consolidação.
            </p>
          )}
        </section>
      )}

      {/* CATÁLOGO */}

      <section className="rounded-3xl border border-[#dbe7de] bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-xl font-black text-[#173222]">
            Catálogo Nutricional
          </h2>

          <p className="mt-2 text-sm text-[#557564]">
            Insumos, composição e custo por unidade de medida cadastrada.
          </p>
        </div>

        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[#dbe7de] text-left text-xs uppercase tracking-wide text-[#557564]">
                <th className="py-4 pr-4">Nome</th>
                <th className="py-4 pr-4">Tipo</th>
                <th className="py-4 pr-4">Unidade</th>
                <th className="py-4 pr-4 text-right">Custo unitário</th>
                <th className="py-4 pr-4 text-right">PB</th>
                <th className="py-4 text-right">NDT</th>
              </tr>
            </thead>

            <tbody>
              {itens.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#edf2ee] last:border-0"
                >
                  <td className="py-4 pr-4 font-semibold text-[#173222]">
                    {item.nome}
                  </td>

                  <td className="py-4 pr-4 text-[#557564]">
                    {nomeTipo(item.tipo)}
                  </td>

                  <td className="py-4 pr-4 text-[#557564]">
                    {item.unidade_medida || "—"}
                  </td>

                  <td className="py-4 pr-4 text-right font-semibold text-[#173222]">
                    {moedaBRL(numeroOuNull(item.custo_unitario_rs))}
                  </td>

                  <td className="py-4 pr-4 text-right text-[#557564]">
                    {formatarPercentual(item.pb_percent)}
                  </td>

                  <td className="py-4 text-right text-[#557564]">
                    {formatarPercentual(item.ndt_percent)}
                  </td>
                </tr>
              ))}

              {!carregando && itens.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-[#718579]"
                  >
                    Nenhum item nutricional ativo foi encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* APLICAÇÕES */}

      <section className="rounded-3xl border border-[#dbe7de] bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-xl font-black text-[#173222]">
            Aplicações Nutricionais
          </h2>

          <p className="mt-2 text-sm text-[#557564]">
            Doses, alvos e períodos registrados no sistema.
          </p>
        </div>

        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[#dbe7de] text-left text-xs uppercase tracking-wide text-[#557564]">
                <th className="py-4 pr-4">Item</th>
                <th className="py-4 pr-4">Alvo</th>
                <th className="py-4 pr-4">Dose diária</th>
                <th className="py-4 pr-4">Início</th>
                <th className="py-4">Fim</th>
              </tr>
            </thead>

            <tbody>
              {aplicacoes.map((aplicacao) => (
                <tr
                  key={aplicacao.id}
                  className="border-b border-[#edf2ee] last:border-0"
                >
                  <td className="py-4 pr-4 font-semibold text-[#173222]">
                    {aplicacao.item_nome || aplicacao.item_id}
                  </td>

                  <td className="py-4 pr-4 text-[#557564]">
                    {aplicacao.animal_id
                      ? "Animal"
                      : aplicacao.piquete_id
                        ? "Piquete"
                        : "Não identificado"}
                  </td>

                  <td className="py-4 pr-4 text-[#557564]">
                    {formatarNumero(aplicacao.dose_dia)}{" "}
                    {aplicacao.unidade_dose || ""}
                  </td>

                  <td className="py-4 pr-4 text-[#557564]">
                    {formatarData(aplicacao.data_inicio)}
                  </td>

                  <td className="py-4 text-[#557564]">
                    {aplicacao.data_fim
                      ? formatarData(aplicacao.data_fim)
                      : "Em andamento"}
                  </td>
                </tr>
              ))}

              {!carregando && aplicacoes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-[#718579]"
                  >
                    Nenhuma aplicação nutricional ativa foi encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* RESPONSABILIDADE TÉCNICA */}

      {/* ASSISTENTE NURA — MOTOR EXISTENTE */}
      <section className="rounded-3xl border border-[#b9d9c2] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              Inteligência nutricional
            </span>

            <h2 className="mt-3 text-xl font-black text-[#173222]">
              NURA — Assistente de Nutrição e Engorda
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#557564]">
              Consulte orientações sobre alimentos, minerais, suplementos,
              aplicações e manejo nutricional. O assistente recebe o contexto
              do catálogo e das aplicações atualmente carregadas.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-[#dbe7de] bg-[#f5faf6] px-4 py-3 text-xs text-[#557564]">
            Motor NURA existente
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-[#173222]">
              Sua dúvida nutricional
            </span>

            <textarea
              rows={4}
              maxLength={3000}
              value={perguntaNura}
              onChange={(event) => setPerguntaNura(event.target.value)}
              placeholder="Ex.: Como posso avaliar os minerais e suplementos cadastrados para os lotes? Quais dados ainda preciso levantar?"
              className="w-full rounded-xl border border-[#cbdacf] bg-white p-4 text-sm text-[#173222] outline-none transition placeholder:text-[#89998e] focus:border-[#26966a] focus:ring-2 focus:ring-[#26966a]/10"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#718579]">
              Contexto enviado: {itens.length} itens e {aplicacoes.length} aplicações.
            </p>

            <button
              type="button"
              onClick={() => void consultarNura()}
              disabled={consultandoNura || !perguntaNura.trim()}
              className="rounded-xl bg-[#1d7048] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#165738] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {consultandoNura ? "Consultando NURA..." : "Consultar assistente"}
            </button>
          </div>

          {erroNura && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {erroNura}
            </div>
          )}

          {consultandoNura && (
            <div
              role="status"
              className="rounded-xl border border-[#dbe7de] bg-[#f5faf6] p-4 text-sm text-[#557564]"
            >
              O NURA está analisando a pergunta e o contexto nutricional disponível...
            </div>
          )}

          {respostaNura && (
            <article className="rounded-2xl border border-[#b9d9c2] bg-[#f5faf6] p-5">
              <h3 className="font-bold text-[#173222]">
                Orientação do NURA
              </h3>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#294c37]">
                {respostaNura}
              </p>

              {metaNura && (
                <div className="mt-5 border-t border-[#dbe7de] pt-3 text-xs text-[#718579]">
                  Origem informada pelo motor: {metaNura.fonte ?? "não especificada"}.
                  {metaNura.rag_ativado === false
                    ? " A base RAG está desativada nesta execução; não considere a resposta uma revisão bibliográfica validada."
                    : ""}
                </div>
              )}
            </article>
          )}
        </div>
      </section>
      <footer className="rounded-3xl border border-[#dbe7de] bg-white p-6 text-xs leading-relaxed text-[#557564] shadow-sm">
        O PecuariaTech apresenta informações operacionais e econômicas
        calculadas a partir dos registros disponíveis. Os resultados dependem
        da qualidade e da completude dos dados cadastrados. As informações
        não substituem prescrição veterinária ou zootécnica.
      </footer>
    </main>
  );
}

/* =====================================================
   KPI
===================================================== */

function KpiCard({
  title,
  value,
  insight,
}: {
  title: string;
  value: string | number;
  insight: string;
}) {
  return (
    <section className="rounded-3xl border border-[#dbe7de] bg-white p-7 shadow-sm">
      <p className="text-sm text-[#557564]">{title}</p>

      <p className="mt-4 break-words text-2xl font-black text-[#173222] sm:text-3xl">
        {value}
      </p>

      <p className="mt-4 text-sm leading-relaxed text-[#557564]">
        {insight}
      </p>
    </section>
  );
}