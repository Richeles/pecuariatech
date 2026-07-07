"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDashboard } from "../DashboardContext";

// ============================================================
// TIPOS DA RESPOSTA DO MOTOR π (PYTHON)
// ============================================================
type RespostaPython = {
  mensagem: string;
  arquivo: string;
  formato: string;
  tamanho: string;
  planilhas_encontradas: number;
  lancamentos_estimados: number;
  periodo_inicio: string;
  periodo_fim: string;
  documento_tipo: string;
  confianca_documento: number;
  indice_implantacao: number;
  confiabilidade: number;
  qualidade_documento: number;
  cobertura_financeira: number;
  tempo_processamento: string;
  receitas: number;
  despesas: number;
  categorias: number;
  duplicidades: number;
  inconsistencia: number;
  confianca_ia: number;
  auditoria: {
    receita_total: number;
    despesa_total: number;
    lucro: number;
    roi: number;
  };
  risco: string;
  oportunidade: string;
  centro_custo: string;
  fonte_receita: string;
  recomendacao: string;
  modulos: {
    financeiro: boolean;
    dashboard: boolean;
    views: boolean;
    motor_pi: boolean;
    linha_tempo: boolean;
    planilha_operacional: boolean;
    especialistas: boolean;
  };
  especialistas: string[];
  proximas_acoes: string[];
  ia_usada: boolean;
  inseridos: number;
  erros: number;
};

type Plano = "starter" | "pro" | "master" | "dominus";

type Props = {
  tipo: "rebanho" | "financeiro" | "pastagem" | "engorda";
  onSuccess?: () => void;
  onError?: (msg: string) => void;
};

// ============================================================
// COMPONENTE PRINCIPAL – IMPLANTAR FAZENDA (EQUAÇÃO X)
// ============================================================
export default function UploadPlanilha({ tipo, onSuccess, onError }: Props) {
  const { refreshData } = useDashboard();

  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [modoOrigem, setModoOrigem] = useState<"excel" | "pdf" | "csv" | null>(null);

  const [resposta, setResposta] = useState<RespostaPython | null>(null);
  const [implantacaoConcluida, setImplantacaoConcluida] = useState(false);

  const [plano, setPlano] = useState<Plano>("starter");
  const [nomePlano, setNomePlano] = useState<string>("Básico");

  const [etapas, setEtapas] = useState<
    { id: number; label: string; status: "pendente" | "em_andamento" | "concluido" | "erro" }[]
  >([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // ============================================================
  // MAPEAMENTO DE PLANOS (EQUAÇÃO Z – GOVERNANÇA)
  // ============================================================
  const mapearPlano = (nome: string): { codigo: Plano; exibicao: string } => {
    const lower = nome.toLowerCase().trim();
    switch (lower) {
      case "básico":
      case "basico":
      case "starter":
        return { codigo: "starter", exibicao: "Básico" };
      case "profissional":
      case "pro":
        return { codigo: "pro", exibicao: "Profissional" };
      case "ultra":
      case "master":
        return { codigo: "master", exibicao: "Ultra" };
      case "empresarial":
      case "business":
        return { codigo: "master", exibicao: "Empresarial" };
      case "dominus":
      case "dominus 360°":
        return { codigo: "dominus", exibicao: "Dominus 360°" };
      default:
        return { codigo: "starter", exibicao: "Básico" };
    }
  };

  // ============================================================
  // BUSCAR PLANO DO USUÁRIO (EQUAÇÃO Z)
  // ============================================================
  useEffect(() => {
    const fetchPlano = async () => {
      try {
        const res = await fetch("/api/assinaturas/status");
        if (res.ok) {
          const data = await res.json();
          if (data?.plano) {
            const mapeado = mapearPlano(data.plano);
            setPlano(mapeado.codigo);
            setNomePlano(mapeado.exibicao);
            return;
          }
        }
        const supabase = (await import("@/app/lib/supabase-browser")).createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("assinaturas")
            .select("plano")
            .eq("user_id", user.id)
            .maybeSingle();
          if (data?.plano) {
            const mapeado = mapearPlano(data.plano);
            setPlano(mapeado.codigo);
            setNomePlano(mapeado.exibicao);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar plano:", error);
      }
    };
    fetchPlano();
  }, []);

  // ============================================================
  // VALIDAÇÃO DE FORMATO (APENAS PARA EXPERIÊNCIA)
  // ============================================================
  const isFormatoPermitido = (nome: string) => {
    const ext = nome.split('.').pop()?.toLowerCase();
    // CSV é permitido em todos os planos (ou pode ser restrito a partir do Pro)
    if (plano === "starter") return ext === "xlsx" || ext === "xls" || ext === "csv";
    return ext === "xlsx" || ext === "xls" || ext === "pdf" || ext === "csv";
  };

  // ============================================================
  // HANDLE UPLOAD – APENAS ENCAMINHA PARA O MOTOR π
  // ============================================================
  const handleUpload = async () => {
    if (!arquivo) {
      setMensagem("❌ Selecione um arquivo primeiro.");
      return;
    }

    if (!isFormatoPermitido(arquivo.name)) {
      setMensagem(`❌ O formato não é permitido no plano ${nomePlano}.`);
      return;
    }

    setLoading(true);
    setMensagem("");
    setResposta(null);
    setImplantacaoConcluida(false);

    const etapasIniciais = [
      { id: 1, label: "📤 Recebendo arquivo", status: "em_andamento" as const },
      { id: 2, label: "🧠 Enviando ao Motor π (Python)", status: "pendente" as const },
      { id: 3, label: "🔍 Detectando formato (Equação Z)", status: "pendente" as const },
      { id: 4, label: "📖 Lendo documento", status: "pendente" as const },
      { id: 5, label: "📊 Normalizando dados", status: "pendente" as const },
      { id: 6, label: "✅ Validando informações", status: "pendente" as const },
      { id: 7, label: "💾 Persistindo na Equação Y", status: "pendente" as const },
      { id: 8, label: "📈 Gerando auditoria", status: "pendente" as const },
      { id: 9, label: "🔄 Sincronizando Dashboards", status: "pendente" as const },
    ];
    setEtapas(etapasIniciais);

    try {
      const supabase = (await import("@/app/lib/supabase-browser")).createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const formData = new FormData();
      formData.append("file", arquivo);
      formData.append("tipo", tipo);
      formData.append("user_id", user?.id || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261");
      formData.append("plano", plano);

      console.log("📤 [X] Enviando para o Motor π:", arquivo.name);

      const res = await fetch("/api/upload-arquivo", {
        method: "POST",
        body: formData,
      });

      console.log("📥 [X] Status HTTP:", res.status);

      const result = await res.json();
      console.log("📦 [X] Resposta do Motor π:", result);

      if (res.ok) {
        setEtapas(etapasIniciais.map((e) => ({ ...e, status: "concluido" })));

        const dados: RespostaPython = {
          mensagem: result.mensagem || "✅ Implantação concluída!",
          arquivo: result.arquivo || arquivo.name,
          formato: result.formato || (arquivo.name.endsWith('.pdf') ? "PDF" : arquivo.name.endsWith('.csv') ? "CSV" : "Excel"),
          tamanho: result.tamanho || "—",
          planilhas_encontradas: result.planilhas_encontradas || 0,
          lancamentos_estimados: result.lancamentos_estimados || 0,
          periodo_inicio: result.periodo_inicio || "—",
          periodo_fim: result.periodo_fim || "—",
          documento_tipo: result.documento_tipo || "Não identificado",
          confianca_documento: result.confianca_documento || 0,
          indice_implantacao: result.indice_implantacao || 0,
          confiabilidade: result.confiabilidade || 0,
          qualidade_documento: result.qualidade_documento || 0,
          cobertura_financeira: result.cobertura_financeira || 0,
          tempo_processamento: result.tempo_processamento || "—",
          receitas: result.receitas || 0,
          despesas: result.despesas || 0,
          categorias: result.categorias || 0,
          duplicidades: result.duplicidades || 0,
          inconsistencia: result.inconsistencias || 0,
          confianca_ia: result.confianca_ia || 0,
          auditoria: {
            receita_total: result.auditoria?.receita_total || 0,
            despesa_total: result.auditoria?.despesa_total || 0,
            lucro: result.auditoria?.lucro || 0,
            roi: result.auditoria?.roi || 0,
          },
          risco: result.risco || "—",
          oportunidade: result.oportunidade || "—",
          centro_custo: result.centro_custo || "—",
          fonte_receita: result.fonte_receita || "—",
          recomendacao: result.recomendacao || "—",
          modulos: {
            financeiro: result.modulos?.financeiro || false,
            dashboard: result.modulos?.dashboard || false,
            views: result.modulos?.views || false,
            motor_pi: result.modulos?.motor_pi || false,
            linha_tempo: result.modulos?.linha_tempo || false,
            planilha_operacional: result.modulos?.planilha_operacional || false,
            especialistas: result.modulos?.especialistas || false,
          },
          especialistas: result.especialistas || [],
          proximas_acoes: result.proximas_acoes || [
            "Abrir Dashboard Financeiro",
            "Ver recomendações do CFO",
            "Explorar Linha do Tempo",
          ],
          ia_usada: result.ia_usada || false,
          inseridos: result.inseridos || 0,
          erros: result.erros || 0,
        };

        setResposta(dados);
        setImplantacaoConcluida(true);
        setMensagem(dados.mensagem);

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("dashboard_cache");
          localStorage.removeItem("dashboard_cache");
        }

        if (refreshData && typeof refreshData === "function") {
          await refreshData();
          console.log("[X] Dashboards atualizados via contexto.");
        } else {
          console.warn("[X] refreshData não disponível. Recarregando página como fallback.");
          window.location.reload();
        }

        if (onSuccess) onSuccess();
      } else {
        setMensagem(`❌ Erro do Motor π: ${result.error || "Falha na importação"}`);
        setEtapas(etapasIniciais.map((e) => ({ ...e, status: "erro" })));
        if (onError) onError(result.error);
      }
    } catch (error) {
      console.error("[X] Erro no envio:", error);
      setMensagem("❌ Erro de conexão com o Motor π. Verifique se o servidor Python está rodando.");
      setEtapas(etapas.map((e) => ({ ...e, status: "erro" })));
    }
    setLoading(false);
  };

  // ============================================================
  // RENDERIZAÇÃO – IMPLANTAÇÃO CONCLUÍDA (EQUAÇÃO X)
  // ============================================================
  if (implantacaoConcluida && resposta) {
    const { auditoria, modulos, especialistas, proximas_acoes } = resposta;

    return (
      <div className="bg-[#1A3F2A]/60 rounded-3xl border border-[#34D399]/30 p-8 backdrop-blur-sm space-y-6">
        <div className="text-center">
          <div className="text-6xl">🏆</div>
          <h2 className="text-2xl font-bold text-white">FAZENDA IMPLANTADA</h2>
          <p className="text-sm text-[#A7F3D0]/60">{resposta.mensagem}</p>
          <p className="text-xs text-[#A7F3D0]/40">
            Arquivo: {resposta.arquivo} • {resposta.formato} • {resposta.tamanho}
          </p>
          {resposta.ia_usada && (
            <p className="text-xs text-yellow-400/70">🧠 IA Cognitiva auxiliou na interpretação (Equação Z).</p>
          )}
          {resposta.inseridos > 0 && (
            <p className="text-xs text-green-400/70">✅ {resposta.inseridos} registros persistidos na Equação Y.</p>
          )}
          {resposta.erros > 0 && (
            <p className="text-xs text-red-400/70">⚠️ {resposta.erros} registros ignorados.</p>
          )}
        </div>

        {/* ÍNDICES DE IMPLANTAÇÃO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-[#0F2A1A]/30 rounded-xl p-3 text-center border border-[#34D399]/10">
            <div className="text-2xl font-bold text-[#34D399]">{resposta.indice_implantacao}%</div>
            <div className="text-xs text-[#A7F3D0]/60">Implantação</div>
          </div>
          <div className="bg-[#0F2A1A]/30 rounded-xl p-3 text-center border border-[#34D399]/10">
            <div className="text-2xl font-bold text-[#34D399]">{resposta.confiabilidade}%</div>
            <div className="text-xs text-[#A7F3D0]/60">Confiabilidade</div>
          </div>
          <div className="bg-[#0F2A1A]/30 rounded-xl p-3 text-center border border-[#34D399]/10">
            <div className="text-2xl font-bold text-[#34D399]">{resposta.qualidade_documento}%</div>
            <div className="text-xs text-[#A7F3D0]/60">Qualidade Doc.</div>
          </div>
          <div className="bg-[#0F2A1A]/30 rounded-xl p-3 text-center border border-[#34D399]/10">
            <div className="text-2xl font-bold text-[#34D399]">{resposta.cobertura_financeira}%</div>
            <div className="text-xs text-[#A7F3D0]/60">Cobertura Fin.</div>
          </div>
        </div>

        {/* MÓDULOS IMPLANTADOS */}
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-2 text-center">Módulos Atualizados</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: "financeiro", label: "Financeiro" },
              { key: "dashboard", label: "Dashboard HUB" },
              { key: "views", label: "Views (Y)" },
              { key: "motor_pi", label: "Motor π" },
              { key: "linha_tempo", label: "Linha do Tempo" },
              { key: "planilha_operacional", label: "Planilha Operacional" },
              { key: "especialistas", label: "Especialistas", colSpan: true },
            ].map((item) => (
              <div
                key={item.key}
                className={`bg-[#0F2A1A]/30 rounded-lg p-3 flex items-center gap-2 ${
                  item.colSpan ? "col-span-2 justify-center" : ""
                }`}
              >
                <span
                  className={
                    modulos[item.key as keyof typeof modulos]
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                >
                  {modulos[item.key as keyof typeof modulos] ? "✓" : "⏳"}
                </span>
                <span className="text-xs text-[#A7F3D0]/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ESPECIALISTAS */}
        {especialistas.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-2 text-center">Especialistas Ativados</p>
            <div className="flex flex-wrap justify-center gap-2">
              {especialistas.map((esp, idx) => (
                <span key={idx} className="px-3 py-1 bg-[#34D399]/10 border border-[#34D399]/20 rounded-full text-xs text-[#A7F3D0]/80">
                  {esp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PRÓXIMAS AÇÕES */}
        {proximas_acoes.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-2 text-center">Próximas Ações</p>
            <ul className="text-sm text-[#A7F3D0]/80 text-center space-y-1">
              {proximas_acoes.map((acao, idx) => (
                <li key={idx}>➡ {acao}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AUDITORIA */}
        <div className="bg-[#0F2A1A]/50 rounded-xl p-5 border border-[#34D399]/20 text-left max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-[#34D399] mb-3">📊 Auditoria do Motor π</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between border-b border-[#34D399]/10 py-1">
              <span className="text-[#A7F3D0]/60">Receitas</span>
              <span className="text-white font-medium">R$ {auditoria.receita_total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-[#34D399]/10 py-1">
              <span className="text-[#A7F3D0]/60">Despesas</span>
              <span className="text-white font-medium">R$ {auditoria.despesa_total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-[#34D399]/10 py-1">
              <span className="text-[#A7F3D0]/60">Lucro</span>
              <span className="text-green-400 font-medium">R$ {auditoria.lucro.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-[#34D399]/10 py-1">
              <span className="text-[#A7F3D0]/60">ROI</span>
              <span className="text-[#34D399] font-medium">{auditoria.roi}%</span>
            </div>
            <div className="flex justify-between border-b border-[#34D399]/10 py-1 col-span-2">
              <span className="text-[#A7F3D0]/60">Maior risco</span>
              <span className="text-yellow-400 font-medium">{resposta.risco}</span>
            </div>
            <div className="flex justify-between border-b border-[#34D399]/10 py-1 col-span-2">
              <span className="text-[#A7F3D0]/60">Maior oportunidade</span>
              <span className="text-green-400 font-medium">{resposta.oportunidade}</span>
            </div>
            <div className="flex justify-between border-b border-[#34D399]/10 py-1 col-span-2">
              <span className="text-[#A7F3D0]/60">Maior centro de custo</span>
              <span className="text-white font-medium">{resposta.centro_custo}</span>
            </div>
            <div className="flex justify-between border-b border-[#34D399]/10 py-1 col-span-2">
              <span className="text-[#A7F3D0]/60">Maior receita</span>
              <span className="text-white font-medium">{resposta.fonte_receita}</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-[#34D399]/10 rounded-lg border border-[#34D399]/20">
            <p className="text-xs text-[#A7F3D0]/80">💡 Recomendação do CFO (Equação Z)</p>
            <p className="text-sm text-white font-medium">{resposta.recomendacao}</p>
          </div>
        </div>

        {/* UPGRADE DE PLANO */}
        {plano !== "dominus" && (
          <div className="max-w-2xl mx-auto text-center">
            <button
              onClick={() => setShowUpgrade(!showUpgrade)}
              className="text-sm text-[#34D399] hover:text-[#10B981] transition underline"
            >
              {showUpgrade ? "Ocultar upgrade" : "🔓 Migrar para Dominus 360°"}
            </button>
            {showUpgrade && (
              <div className="mt-3 p-4 bg-[#0F2A1A]/50 rounded-xl border border-[#34D399]/20">
                <p className="text-sm text-[#A7F3D0]/80">
                  {plano === "starter" && "Atualize para Dominus 360° e tenha acesso a todos os recursos exclusivos."}
                  {plano === "pro" && "Leve sua gestão ao próximo nível com o Dominus 360°."}
                  {(plano === "master") && "Você já está no topo, mas o Dominus 360° oferece ainda mais inteligência e automação."}
                </p>
                <ul className="text-xs text-left list-disc list-inside text-[#A7F3D0]/60 mt-2 space-y-1">
                  <li>✓ CFO Autônomo com IA preditiva</li>
                  <li>✓ Suporte prioritário 24/7</li>
                  <li>✓ Relatórios personalizados executivos</li>
                  <li>✓ Auditoria contínua e recomendações estratégicas</li>
                  <li>✓ Integração total com Planilha Operacional e Linha do Tempo</li>
                </ul>
                <button className="mt-3 px-4 py-2 bg-[#34D399] text-[#0F2A1A] font-bold rounded-lg hover:bg-[#10B981] transition text-sm">
                  Migrar para Dominus 360°
                </button>
              </div>
            )}
          </div>
        )}

        {/* NAVEGAÇÃO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mt-4">
          <Link href="/pt/dashboard/financeiro">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition text-sm">
              📊 Dashboard HUB
            </button>
          </Link>
          <Link href="/pt/dashboard/financeiro">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              💰 Financeiro
            </button>
          </Link>
          <Link href="/pt/dashboard/cfo">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              🧠 CFO Inteligente
            </button>
          </Link>
          <Link href="/pt/dashboard/linha-do-tempo">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              📈 Linha do Tempo
            </button>
          </Link>
          <Link href="/pt/dashboard/planilha-operacional">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              📋 Planilha Op.
            </button>
          </Link>
          <button
            onClick={() => {
              setImplantacaoConcluida(false);
              setResposta(null);
              setArquivo(null);
              setEtapas([]);
              setModoOrigem(null);
            }}
            className="w-full px-4 py-3 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#A7F3D0] font-bold hover:bg-[#34D399]/20 transition text-sm col-span-2 md:col-span-1"
          >
            🔄 Nova Implantação
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // FORMULÁRIO DE IMPLANTAÇÃO (EQUAÇÃO X)
  // ============================================================
  return (
    <div className="bg-[#1A3F2A]/60 rounded-3xl border border-[#34D399]/20 p-6 backdrop-blur-sm">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm font-bold text-[#34D399] hover:text-[#10B981] transition flex items-center gap-2"
      >
        {showForm ? "✕ Fechar" : "🏗️ Implantar Fazenda"}
      </button>

      {showForm && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-[#A7F3D0]/60">
            Envie os documentos da sua fazenda para o Motor π.
            <br />
            <span className="text-xs text-[#A7F3D0]/40">
              Plano atual: <span className="uppercase font-bold text-[#34D399]">{nomePlano}</span>
            </span>
          </p>

          <div>
            <p className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-2">Origem dos Dados</p>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setModoOrigem("excel");
                  setArquivo(null);
                  setMensagem("");
                }}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  modoOrigem === "excel"
                    ? "border-[#34D399] bg-[#34D399]/10"
                    : "border-[#34D399]/20 hover:border-[#34D399]/40"
                }`}
              >
                <div className="text-3xl">📊</div>
                <div className={`text-sm font-bold ${modoOrigem === "excel" ? "text-[#34D399]" : "text-[#A7F3D0]/60"}`}>
                  Excel (.xlsx)
                </div>
                <div className="text-[8px] text-[#A7F3D0]/30">✓ Disponível</div>
              </button>
              <button
                onClick={() => {
                  setModoOrigem("pdf");
                  setArquivo(null);
                  setMensagem("");
                }}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  modoOrigem === "pdf"
                    ? "border-[#34D399] bg-[#34D399]/10"
                    : "border-[#34D399]/20 hover:border-[#34D399]/40"
                } ${plano === "starter" ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={plano === "starter"}
                title={plano === "starter" ? "Disponível a partir do plano Profissional" : ""}
              >
                <div className="text-3xl">📄</div>
                <div className={`text-sm font-bold ${modoOrigem === "pdf" ? "text-[#34D399]" : "text-[#A7F3D0]/60"}`}>
                  PDF Financeiro
                </div>
                {plano === "starter" && <div className="text-[8px] text-yellow-400/50">🔒 Upgrade</div>}
                {plano !== "starter" && <div className="text-[8px] text-[#34D399]/50">✓ Disponível</div>}
              </button>
              <button
                onClick={() => {
                  setModoOrigem("csv");
                  setArquivo(null);
                  setMensagem("");
                }}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  modoOrigem === "csv"
                    ? "border-[#34D399] bg-[#34D399]/10"
                    : "border-[#34D399]/20 hover:border-[#34D399]/40"
                }`}
              >
                <div className="text-3xl">📋</div>
                <div className={`text-sm font-bold ${modoOrigem === "csv" ? "text-[#34D399]" : "text-[#A7F3D0]/60"}`}>
                  CSV
                </div>
                <div className="text-[8px] text-[#A7F3D0]/30">✓ Disponível</div>
              </button>
            </div>
            <div className="mt-3 p-3 bg-[#0F2A1A]/30 rounded-xl border border-dashed border-[#34D399]/10">
              <p className="text-xs text-[#A7F3D0]/30 text-center">
                Em breve: ERP • Contabilidade • Cooperativa • Banco • API Contábil
              </p>
            </div>
          </div>

          {modoOrigem && (
            <div className="border-2 border-dashed border-[#34D399]/20 rounded-xl p-4 text-center hover:border-[#34D399]/40 transition cursor-pointer">
              <input
                type="file"
                accept={
                  modoOrigem === "excel"
                    ? ".xlsx,.xls"
                    : modoOrigem === "pdf"
                    ? ".pdf"
                    : ".csv"
                }
                className="hidden"
                id="upload-arquivo"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!isFormatoPermitido(file.name)) {
                      setMensagem(`❌ O formato ${file.name.split('.').pop()} não é permitido no plano ${nomePlano}.`);
                      return;
                    }
                    setArquivo(file);
                    setMensagem("");
                    setResposta(null);
                    setEtapas([]);
                  }
                }}
              />
              <label htmlFor="upload-arquivo" className="cursor-pointer block">
                <div className="text-3xl mb-2">📂</div>
                <p className="text-[#A7F3D0]/60 text-sm">
                  {arquivo ? arquivo.name : `Selecione o arquivo ${modoOrigem.toUpperCase()}`}
                </p>
                <p className="text-xs text-[#A7F3D0]/40 mt-1">
                  {modoOrigem === "excel" ? ".xlsx, .xls" : modoOrigem === "pdf" ? ".pdf" : ".csv"}
                </p>
              </label>
            </div>
          )}

          {etapas.length > 0 && (
            <div className="bg-[#0F2A1A]/30 rounded-xl p-4 space-y-1 border border-[#34D399]/10">
              {etapas.map((etapa) => (
                <div key={etapa.id} className="flex items-center gap-2 text-xs text-[#A7F3D0]/60">
                  <span className="w-4">
                    {etapa.status === "concluido" && "✅"}
                    {etapa.status === "em_andamento" && "⏳"}
                    {etapa.status === "pendente" && "⬜"}
                    {etapa.status === "erro" && "❌"}
                  </span>
                  <span className={etapa.status === "concluido" ? "text-[#34D399]" : ""}>
                    {etapa.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {mensagem && (
            <div className="bg-[#0F2A1A]/30 rounded-xl p-3">
              <p className="text-xs text-[#A7F3D0]/60">{mensagem}</p>
            </div>
          )}

          {arquivo && !implantacaoConcluida && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50 text-sm"
            >
              {loading ? "⏳ Processando..." : "🚀 Enviar para o Motor π"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}