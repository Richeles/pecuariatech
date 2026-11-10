"use client";

import { useCallback, useEffect, useState } from "react";

type Campanha = {
  id: string;
  ativo: boolean;
  desconto: number;
  planos: string[];
  periodos: string[];
  data_inicio: string | null;
  data_fim: string | null;
};

const PLANOS = [
  ["basico", "Básico"],
  ["profissional", "Profissional"],
  ["ultra", "Ultra"],
  ["empresarial", "Empresarial"],
  ["premium_dominus", "Premium Dominus"],
];

const PERIODOS = [
  ["mensal", "Mensal"],
  ["trimestral", "Trimestral"],
  ["anual", "Anual"],
];

const DESCONTOS = [5, 10, 15, 20];

function dataLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function PromocoesAdminPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [selecionada, setSelecionada] = useState("");
  const [desconto, setDesconto] = useState(10);
  const [ativo, setAtivo] = useState(false);
  const [planos, setPlanos] = useState<string[]>([]);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setMensagem("");

    try {
      const response = await fetch("/api/admin/promocoes", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Sessão não autorizada."
            : response.status === 403
              ? "Acesso exclusivo do AdminMaster."
              : "Não foi possível carregar as campanhas."
        );
      }

      const data: Campanha[] = await response.json();
      setCampanhas(data);

      const atual = data.find((item) => item.ativo) ?? data[0];

      if (atual) {
        setSelecionada(atual.id);
        setDesconto(atual.desconto);
        setAtivo(atual.ativo);
        setPlanos(atual.planos ?? []);
        setPeriodos(atual.periodos ?? []);
        setInicio(dataLocal(atual.data_inicio));
        setFim(dataLocal(atual.data_fim));
      }
    } catch (error) {
      setMensagem(
        error instanceof Error ? error.message : "Erro inesperado."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function selecionarCampanha(id: string) {
    const item = campanhas.find((campanha) => campanha.id === id);
    if (!item) return;

    setSelecionada(item.id);
    setDesconto(item.desconto);
    setAtivo(item.ativo);
    setPlanos(item.planos ?? []);
    setPeriodos(item.periodos ?? []);
    setInicio(dataLocal(item.data_inicio));
    setFim(dataLocal(item.data_fim));
    setMensagem("");
  }

  function alternar(
    valor: string,
    lista: string[],
    atualizar: (valores: string[]) => void
  ) {
    atualizar(
      lista.includes(valor)
        ? lista.filter((item) => item !== valor)
        : [...lista, valor]
    );
  }

  async function salvar() {
    if (!selecionada) {
      setMensagem("Nenhuma campanha disponível para edição.");
      return;
    }

    if (
      ativo &&
      (!inicio || !fim || planos.length === 0 || periodos.length === 0)
    ) {
      setMensagem("Informe validade, planos e períodos da campanha.");
      return;
    }

    setSalvando(true);
    setMensagem("");

    try {
      const response = await fetch("/api/admin/promocoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selecionada,
          ativo,
          desconto,
          planos,
          periodos,
          data_inicio: inicio ? new Date(inicio).toISOString() : null,
          data_fim: fim ? new Date(fim).toISOString() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const erros: Record<string, string> = {
          another_campaign_is_already_active:
            "Já existe outra campanha ativa.",
          invalid_campaign_configuration:
            "Configuração de campanha inválida.",
          invalid_campaign_validity_period:
            "O período de validade é inválido.",
          campaign_not_found: "Campanha não encontrada.",
          promotion_update_failed: "Falha ao atualizar a campanha.",
        };

        throw new Error(
          erros[result.error] ?? result.error ?? "Falha ao salvar."
        );
      }

      setMensagem("Campanha atualizada com sucesso.");
      await carregar();
    } catch (error) {
      setMensagem(
        error instanceof Error ? error.message : "Erro ao salvar."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <main className="p-8">Carregando painel de promoções...</main>;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Governança comercial
        </p>
        <h1 className="mt-2 text-3xl font-bold">Promoções e concessões</h1>
        <p className="mt-2 text-sm text-gray-500">
          Administração de campanhas comerciais e acesso gratuito.
        </p>
      </header>

      <section className="rounded-xl border p-6">
        <h2 className="text-xl font-bold">Campanha comercial</h2>
        <p className="mt-1 text-sm text-gray-500">
          Edite a campanha existente. Somente uma campanha pode permanecer ativa.
        </p>

        {campanhas.length === 0 ? (
          <p className="mt-5 text-sm text-amber-700">
            Nenhuma campanha cadastrada na tabela comercial.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            <label className="block text-sm font-medium">
              Campanha
              <select
                className="mt-2 w-full rounded-lg border p-3"
                value={selecionada}
                onChange={(event) => selecionarCampanha(event.target.value)}
              >
                {campanhas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.ativo ? "Ativa" : "Inativa"} — {item.id}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <label className="block text-sm font-medium">
                Desconto comercial
              </label>
              <select
                className="mt-2 w-full rounded-lg border p-3"
                value={desconto}
                onChange={(event) => setDesconto(Number(event.target.value))}
              >
                {DESCONTOS.map((valor) => (
                  <option key={valor} value={valor}>
                    {valor}%
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                A tabela comercial atual permite descontos de 5% a 20%.
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Planos contemplados</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PLANOS.map(([valor, nome]) => (
                  <label key={valor} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planos.includes(valor)}
                      onChange={() => alternar(valor, planos, setPlanos)}
                    />
                    {nome}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Períodos</p>
              <div className="flex flex-wrap gap-5">
                {PERIODOS.map(([valor, nome]) => (
                  <label key={valor} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={periodos.includes(valor)}
                      onChange={() => alternar(valor, periodos, setPeriodos)}
                    />
                    {nome}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Início da campanha
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-lg border p-3"
                  value={inicio}
                  onChange={(event) => setInicio(event.target.value)}
                />
              </label>

              <label className="text-sm font-medium">
                Fim da campanha
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-lg border p-3"
                  value={fim}
                  onChange={(event) => setFim(event.target.value)}
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(event) => setAtivo(event.target.checked)}
              />
              <span className="font-semibold">Campanha ativa</span>
            </label>

            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar campanha"}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-emerald-300 p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Acesso gratuito
        </p>
        <h2 className="mt-2 text-xl font-bold">Concessão de 100% de desconto</h2>
        <p className="mt-2 text-sm text-gray-600">
          Conceda acesso individual gratuito por 15 a 365 dias, selecionando
          usuário e plano. O mecanismo existente registra a concessão sem
          alterar a assinatura paga.
        </p>
        <a
          href="/dashboard/admin/usuarios"
          className="mt-5 inline-block rounded-lg bg-emerald-700 px-6 py-3 font-semibold text-white"
        >
          Gerenciar concessões gratuitas
        </a>
      </section>

      {mensagem && (
        <p role="status" className="rounded-lg border p-4 text-sm">
          {mensagem}
        </p>
      )}
    </main>
  );
}