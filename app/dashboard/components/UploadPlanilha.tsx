"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDashboard } from "../DashboardContext";

// ============================================================
// TIPOS DA RESPOSTA DO MOTOR Ï€ (PYTHON)
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
  tipo: "rebanho" | "financeiro" | "pastagem" | "engorda" | "auto";
  onSuccess?: () => void;
  onError?: (msg: string) => void;
};

// ============================================================
// COMPONENTE PRINCIPAL â€“ IMPLANTAR FAZENDA (EQUAÃ‡ÃƒO X)
// ============================================================
export default function UploadPlanilha({ tipo, onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [modoOrigem, setModoOrigem] = useState<"excel" | "pdf" | "csv" | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [resposta, setResposta] = useState<RespostaPython | null>(null);
  const [implantacaoConcluida, setImplantacaoConcluida] = useState(false);

  const [plano, setPlano] = useState<Plano>("starter");
  const [nomePlano, setNomePlano] = useState<string>("BÃ¡sico");

  const [etapas, setEtapas] = useState<
    { id: number; label: string; status: "pendente" | "em_andamento" | "concluido" | "erro" }[]
  >([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { triggerDashboardRefresh } = useDashboard();

  // ============================================================
  // ESTADO DE AUTENTICAÃ‡ÃƒO
  // ============================================================
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = (await import("@/app/lib/supabase-browser")).createClient();
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data?.session?.user);
        console.log("ðŸ”µ [Auth check] isAuthenticated:", !!data?.session?.user);
      } catch (err) {
        console.error("âŒ Erro ao verificar autenticaÃ§Ã£o:", err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // ============================================================
  // MAPEAMENTO DE PLANOS (EQUAÃ‡ÃƒO Z â€“ GOVERNANÃ‡A)
  // ============================================================
  const mapearPlano = (nome: string): { codigo: Plano; exibicao: string } => {
    const lower = nome.toLowerCase().trim();
    switch (lower) {
      case "bÃ¡sico":
      case "basico":
      case "starter":
        return { codigo: "starter", exibicao: "BÃ¡sico" };
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
      case "dominus 360Â°":
        return { codigo: "dominus", exibicao: "Dominus 360Â°" };
      default:
        return { codigo: "starter", exibicao: "BÃ¡sico" };
    }
  };

  // ============================================================
  // BUSCAR PLANO DO USUÃRIO (EQUAÃ‡ÃƒO Z)
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
        let user = null;
        const { data } = await supabase.auth.getUser();
        user = data?.user ?? null;
        if (!user) {
          const { data: { session } } = await supabase.auth.getSession();
          user = session?.user ?? null;
        }
        if (!user) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const { data } = await supabase.auth.getUser();
          user = data?.user ?? null;
        }
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
  // VALIDAÃ‡ÃƒO DE FORMATO
  // ============================================================
  const isFormatoPermitido = (nome: string) => {
    const ext = nome.split('.').pop()?.toLowerCase();
    if (plano === "starter") return ext === "xlsx" || ext === "xls" || ext === "csv";
    return ext === "xlsx" || ext === "xls" || ext === "pdf" || ext === "csv";
  };

  // ============================================================
  // HANDLE UPLOAD â€“ COM LOGS DE DEPURAÃ‡ÃƒO
  // ============================================================
  const handleUpload = async () => {
    console.log("ðŸ”µ 1 - handleUpload iniciado");

    if (!arquivo) {
      setMensagem("âŒ Selecione um arquivo primeiro.");
      console.log("ðŸ”´ 2 - Sem arquivo, abortando");
      return;
    }
    console.log("ðŸ”µ 2 - Arquivo:", arquivo.name);

    if (!isFormatoPermitido(arquivo.name)) {
      setMensagem(`âŒ O formato nÃ£o Ã© permitido no plano ${nomePlano}.`);
      console.log("ðŸ”´ 3 - Formato nÃ£o permitido, abortando");
      return;
    }
    console.log("ðŸ”µ 3 - Formato permitido");

    setUploadError(null);
    setUploadSuccess(false);
    setLoading(true);
    setMensagem("");
    setResposta(null);
    setImplantacaoConcluida(false);

    const etapasIniciais = [
      { id: 1, label: "ðŸ“¤ Recebendo arquivo", status: "em_andamento" as const },
      { id: 2, label: "ðŸ§  Enviando ao Motor Ï€ (Python)", status: "pendente" as const },
      { id: 3, label: "ðŸ” Detectando formato (EquaÃ§Ã£o Z)", status: "pendente" as const },
      { id: 4, label: "ðŸ“– Lendo documento", status: "pendente" as const },
      { id: 5, label: "ðŸ“Š Normalizando dados", status: "pendente" as const },
      { id: 6, label: "âœ… Validando informaÃ§Ãµes", status: "pendente" as const },
      { id: 7, label: "ðŸ’¾ Persistindo na EquaÃ§Ã£o Y", status: "pendente" as const },
      { id: 8, label: "ðŸ“ˆ Gerando auditoria", status: "pendente" as const },
      { id: 9, label: "ðŸ”„ Sincronizando Dashboards", status: "pendente" as const },
    ];
    setEtapas(etapasIniciais);

    try {
      // -------------------------------------------------------
      // OBTENÃ‡ÃƒO DO USUÃRIO (priorizando getSession)
      // -------------------------------------------------------
      console.log("ðŸ”µ 4 - Obtendo usuÃ¡rio...");
      const supabase = (await import("@/app/lib/supabase-browser")).createClient();
      let user = null;

      try {
        // 1. Tentar getSession() primeiro (renova token se necessÃ¡rio)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && sessionData?.session?.user) {
          user = sessionData.session.user;
          console.log("ðŸ”µ 4a - UsuÃ¡rio obtido via getSession:", user.id);
        } else {
          console.log("âš ï¸ 4a - getSession falhou:", sessionError?.message || "sem sessÃ£o");
        }

        // 2. Se falhou, tentar refreshSession()
        if (!user) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshData?.session?.user) {
            user = refreshData.session.user;
            console.log("ðŸ”µ 4b - UsuÃ¡rio obtido via refreshSession:", user.id);
          } else {
            console.log("âš ï¸ 4b - refreshSession falhou:", refreshError?.message || "sem sessÃ£o");
          }
        }

        // 3. Ãšltimo recurso: getUser()
        if (!user) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (!userError && userData?.user) {
            user = userData.user;
            console.log("ðŸ”µ 4c - UsuÃ¡rio obtido via getUser:", user.id);
          } else {
            console.log("âš ï¸ 4c - getUser falhou:", userError?.message || "sem usuÃ¡rio");
          }
        }

                // 4. Aguardar e tentar novamente (caso o cookie esteja sendo restaurado)
        if (!user) {
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retryData } = await supabase.auth.getSession();
          user = retryData?.session?.user ?? null;
          if (user) {
            console.log("🔵 4d - Usuário obtido via retry (getSession):", user.id);
          } else {
            console.log("⚠️ 4d - retry também falhou");
          }
        }

        // ============================================================
        // FALLBACK VIA API (busca usuário via cookie do servidor)
        // ============================================================
        if (!user) {
          console.log("🔵 4e - Tentando fallback via /api/auth/session");
          try {
            const apiRes = await fetch("/api/auth/session");
            if (apiRes.ok) {
              const data = await apiRes.json();
              if (data?.user) {
                user = data.user;
                console.log("🔵 4e - Usuário obtido via API:", user.id);
              } else {
                console.log("⚠️ 4e - API retornou sem usuário");
              }
            } else {
              console.log("⚠️ 4e - API falhou com status:", apiRes.status);
            }
          } catch (err) {
            console.error("❌ 4e - Erro no fallback via API:", err);
          }
        }if (!user?.id) {
        console.log("ðŸ”´ 5 - UsuÃ¡rio nÃ£o encontrado â€“ abortando upload.");
        setUploadError("UsuÃ¡rio nÃ£o autenticado.");
        setMensagem("âŒ Sua sessÃ£o expirou. FaÃ§a login novamente.");
        setEtapas(etapasIniciais.map((e) => ({ ...e, status: "erro" })));
        setLoading(false);
        return;
      }

      const finalUserId = user.id;
      const finalTipo = tipo || "auto";
      const finalPlano = plano || "starter";

      console.log("ðŸ”µ 6 - Montando FormData para:", {
        file: arquivo.name,
        tipo: finalTipo,
        userId: finalUserId,
        plano: finalPlano,
      });

      const formData = new FormData();
      formData.append("file", arquivo);
      formData.append("tipo", finalTipo);
      formData.append("user_id", finalUserId);
      formData.append("plano", finalPlano);

      console.log("ðŸ”µ 7 - Iniciando fetch para /api/upload-arquivo");

      const res = await fetch("/api/upload-arquivo", {
        method: "POST",
        body: formData,
      });

      console.log("ðŸ”µ 8 - Fetch retornou status:", res.status);

      let result: any = {};
      try {
        result = await res.json();
        console.log("ðŸ”µ 9 - Resposta JSON recebida:", result);
      } catch {
        throw new Error("Resposta invÃ¡lida do servidor.");
      }

      if (res.ok) {
        setEtapas(etapasIniciais.map((e) => ({ ...e, status: "concluido" })));

        const dados: RespostaPython = {
          mensagem: result.mensagem || "âœ… ImplantaÃ§Ã£o concluÃ­da!",
          arquivo: result.arquivo || arquivo.name,
          formato: result.formato || (arquivo.name.endsWith('.pdf') ? "PDF" : arquivo.name.endsWith('.csv') ? "CSV" : "Excel"),
          tamanho: result.tamanho || "â€”",
          planilhas_encontradas: result.planilhas_encontradas || 0,
          lancamentos_estimados: result.lancamentos_estimados || 0,
          periodo_inicio: result.periodo_inicio || "â€”",
          periodo_fim: result.periodo_fim || "â€”",
          documento_tipo: result.documento_tipo || "NÃ£o identificado",
          confianca_documento: result.confianca_documento || 0,
          indice_implantacao: result.indice_implantacao || 0,
          confiabilidade: result.confiabilidade || 0,
          qualidade_documento: result.qualidade_documento || 0,
          cobertura_financeira: result.cobertura_financeira || 0,
          tempo_processamento: result.tempo_processamento || "â€”",
          receitas: result.receitas || 0,
          despesas: result.despesas || 0,
          categorias: result.categorias || 0,
          duplicidades: result.duplicidades || 0,
          inconsistencia: result.inconsistencia || 0,
          confianca_ia: result.confianca_ia || 0,
          auditoria: {
            receita_total: result.auditoria?.receita_total || 0,
            despesa_total: result.auditoria?.despesa_total || 0,
            lucro: result.auditoria?.lucro || 0,
            roi: result.auditoria?.roi || 0,
          },
          risco: result.risco || "â€”",
          oportunidade: result.oportunidade || "â€”",
          centro_custo: result.centro_custo || "â€”",
          fonte_receita: result.fonte_receita || "â€”",
          recomendacao: result.recomendacao || "â€”",
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
            "Ver recomendaÃ§Ãµes do CFO",
            "Explorar Linha do Tempo",
          ],
          ia_usada: result.ia_usada || false,
          inseridos: result.inseridos || 0,
          erros: result.erros || 0,
        };

        setResposta(dados);
        setImplantacaoConcluida(true);
        setMensagem(dados.mensagem);
        setUploadSuccess(true);

        if (onSuccess) onSuccess();
        if (triggerDashboardRefresh) triggerDashboardRefresh();
        console.log("âœ… Upload concluÃ­do com sucesso!");
      } else {
        const errorMsg = result.error || result.detail || "Falha na importaÃ§Ã£o";
        setUploadError(errorMsg);
        setMensagem(`âŒ ${errorMsg}`);
        setEtapas(etapasIniciais.map((e) => ({ ...e, status: "erro" })));
        if (onError) onError(errorMsg);
        console.error("âŒ Upload falhou:", errorMsg);
      }
    } catch (error) {
      console.error("[X] Erro no envio:", error);
      const errorMsg = "Erro de conexÃ£o com o Motor Ï€. Verifique se o servidor Python estÃ¡ rodando.";
      setUploadError(errorMsg);
      setMensagem(`âŒ ${errorMsg}`);
      setEtapas(etapasIniciais.map((e) => ({ ...e, status: "erro" })));
    }
    setLoading(false);
  };

  // ============================================================
  // RENDERIZAÃ‡ÃƒO â€“ IMPLANTAÃ‡ÃƒO CONCLUÃDA (inalterada)
  // ============================================================
  if (implantacaoConcluida && resposta) {
    const { auditoria, modulos, especialistas, proximas_acoes } = resposta;

    return (
      <div className="bg-[#1A3F2A]/60 rounded-3xl border border-[#34D399]/30 p-8 backdrop-blur-sm space-y-6">
        <div className="text-center">
          <div className="text-6xl">ðŸ†</div>
          <h2 className="text-2xl font-bold text-white">FAZENDA IMPLANTADA</h2>
          <p className="text-sm text-[#A7F3D0]/60">{resposta.mensagem}</p>
          <p className="text-xs text-[#A7F3D0]/40">
            Arquivo: {resposta.arquivo} â€¢ {resposta.formato} â€¢ {resposta.tamanho}
          </p>
          {resposta.ia_usada && (
            <p className="text-xs text-yellow-400/70">ðŸ§  IA Cognitiva auxiliou na interpretaÃ§Ã£o (EquaÃ§Ã£o Z).</p>
          )}
          {resposta.inseridos > 0 && (
            <p className="text-xs text-green-400/70">âœ… {resposta.inseridos} registros persistidos na EquaÃ§Ã£o Y.</p>
          )}
          {resposta.erros > 0 && (
            <p className="text-xs text-red-400/70">âš ï¸ {resposta.erros} registros ignorados.</p>
          )}
        </div>

        {/* ÃNDICES DE IMPLANTAÃ‡ÃƒO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-[#0F2A1A]/30 rounded-xl p-3 text-center border border-[#34D399]/10">
            <div className="text-2xl font-bold text-[#34D399]">{resposta.indice_implantacao}%</div>
            <div className="text-xs text-[#A7F3D0]/60">ImplantaÃ§Ã£o</div>
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

        {/* MÃ“DULOS IMPLANTADOS */}
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-2 text-center">MÃ³dulos Atualizados</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { key: "financeiro", label: "Financeiro" },
              { key: "dashboard", label: "Dashboard HUB" },
              { key: "views", label: "Views (Y)" },
              { key: "motor_pi", label: "Motor Ï€" },
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
                  {modulos[item.key as keyof typeof modulos] ? "âœ“" : "â³"}
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

        {/* PRÃ“XIMAS AÃ‡Ã•ES */}
        {proximas_acoes.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold text-[#A7F3D0]/40 uppercase tracking-wider mb-2 text-center">PrÃ³ximas AÃ§Ãµes</p>
            <ul className="text-sm text-[#A7F3D0]/80 text-center space-y-1">
              {proximas_acoes.map((acao, idx) => (
                <li key={idx}>âž¡ {acao}</li>
              ))}
            </ul>
          </div>
        )}

        {/* AUDITORIA */}
        <div className="bg-[#0F2A1A]/50 rounded-xl p-5 border border-[#34D399]/20 text-left max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-[#34D399] mb-3">ðŸ“Š Auditoria do Motor Ï€</h3>
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
            <p className="text-xs text-[#A7F3D0]/80">ðŸ’¡ RecomendaÃ§Ã£o do CFO (EquaÃ§Ã£o Z)</p>
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
              {showUpgrade ? "Ocultar upgrade" : "ðŸ”“ Migrar para Dominus 360Â°"}
            </button>
            {showUpgrade && (
              <div className="mt-3 p-4 bg-[#0F2A1A]/50 rounded-xl border border-[#34D399]/20">
                <p className="text-sm text-[#A7F3D0]/80">
                  {plano === "starter" && "Atualize para Dominus 360Â° e tenha acesso a todos os recursos exclusivos."}
                  {plano === "pro" && "Leve sua gestÃ£o ao prÃ³ximo nÃ­vel com o Dominus 360Â°."}
                  {(plano === "master") && "VocÃª jÃ¡ estÃ¡ no topo, mas o Dominus 360Â° oferece ainda mais inteligÃªncia e automaÃ§Ã£o."}
                </p>
                <ul className="text-xs text-left list-disc list-inside text-[#A7F3D0]/60 mt-2 space-y-1">
                  <li>âœ“ CFO AutÃ´nomo com IA preditiva</li>
                  <li>âœ“ Suporte prioritÃ¡rio 24/7</li>
                  <li>âœ“ RelatÃ³rios personalizados executivos</li>
                  <li>âœ“ Auditoria contÃ­nua e recomendaÃ§Ãµes estratÃ©gicas</li>
                  <li>âœ“ IntegraÃ§Ã£o total com Planilha Operacional e Linha do Tempo</li>
                </ul>
                <button className="mt-3 px-4 py-2 bg-[#34D399] text-[#0F2A1A] font-bold rounded-lg hover:bg-[#10B981] transition text-sm">
                  Migrar para Dominus 360Â°
                </button>
              </div>
            )}
          </div>
        )}

        {/* NAVEGAÃ‡ÃƒO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mt-4">
          <Link href="/pt/dashboard/financeiro">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition text-sm">
              ðŸ“Š Dashboard HUB
            </button>
          </Link>
          <Link href="/pt/dashboard/financeiro">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              ðŸ’° Financeiro
            </button>
          </Link>
          <Link href="/pt/dashboard/cfo">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              ðŸ§  CFO Inteligente
            </button>
          </Link>
          <Link href="/pt/dashboard/linha-do-tempo">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              ðŸ“ˆ Linha do Tempo
            </button>
          </Link>
          <Link href="/pt/dashboard/planilha-operacional">
            <button className="w-full px-4 py-3 rounded-xl bg-[#34D399]/20 border border-[#34D399]/30 text-[#A7F3D0] font-bold hover:bg-[#34D399]/30 transition text-sm">
              ðŸ“‹ Planilha Op.
            </button>
          </Link>
          <button
            onClick={() => {
              setImplantacaoConcluida(false);
              setResposta(null);
              setArquivo(null);
              setEtapas([]);
              setModoOrigem(null);
              setUploadError(null);
              setUploadSuccess(false);
            }}
            className="w-full px-4 py-3 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#A7F3D0] font-bold hover:bg-[#34D399]/20 transition text-sm col-span-2 md:col-span-1"
          >
            ðŸ”„ Nova ImplantaÃ§Ã£o
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // FORMULÃRIO DE IMPLANTAÃ‡ÃƒO
  // ============================================================
  return (
    <div className="bg-[#1A3F2A]/60 rounded-3xl border border-[#34D399]/20 p-6 backdrop-blur-sm">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm font-bold text-[#34D399] hover:text-[#10B981] transition flex items-center gap-2"
      >
        {showForm ? "âœ• Fechar" : "ðŸ—ï¸ Implantar Fazenda"}
      </button>

      {showForm && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-[#A7F3D0]/60">
            Envie os documentos da sua fazenda para o Motor Ï€.
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
                  setUploadError(null);
                  setUploadSuccess(false);
                }}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  modoOrigem === "excel"
                    ? "border-[#34D399] bg-[#34D399]/10"
                    : "border-[#34D399]/20 hover:border-[#34D399]/40"
                }`}
              >
                <div className="text-3xl">ðŸ“Š</div>
                <div className={`text-sm font-bold ${modoOrigem === "excel" ? "text-[#34D399]" : "text-[#A7F3D0]/60"}`}>
                  Excel (.xlsx)
                </div>
                <div className="text-[8px] text-[#A7F3D0]/30">âœ“ DisponÃ­vel</div>
              </button>
              <button
                onClick={() => {
                  setModoOrigem("pdf");
                  setArquivo(null);
                  setMensagem("");
                  setUploadError(null);
                  setUploadSuccess(false);
                }}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  modoOrigem === "pdf"
                    ? "border-[#34D399] bg-[#34D399]/10"
                    : "border-[#34D399]/20 hover:border-[#34D399]/40"
                } ${plano === "starter" ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={plano === "starter"}
                title={plano === "starter" ? "DisponÃ­vel a partir do plano Profissional" : ""}
              >
                <div className="text-3xl">ðŸ“„</div>
                <div className={`text-sm font-bold ${modoOrigem === "pdf" ? "text-[#34D399]" : "text-[#A7F3D0]/60"}`}>
                  PDF Financeiro
                </div>
                {plano === "starter" && <div className="text-[8px] text-yellow-400/50">ðŸ”’ Upgrade</div>}
                {plano !== "starter" && <div className="text-[8px] text-[#34D399]/50">âœ“ DisponÃ­vel</div>}
              </button>
              <button
                onClick={() => {
                  setModoOrigem("csv");
                  setArquivo(null);
                  setMensagem("");
                  setUploadError(null);
                  setUploadSuccess(false);
                }}
                className={`p-4 rounded-xl border-2 text-center transition ${
                  modoOrigem === "csv"
                    ? "border-[#34D399] bg-[#34D399]/10"
                    : "border-[#34D399]/20 hover:border-[#34D399]/40"
                }`}
              >
                <div className="text-3xl">ðŸ“‹</div>
                <div className={`text-sm font-bold ${modoOrigem === "csv" ? "text-[#34D399]" : "text-[#A7F3D0]/60"}`}>
                  CSV
                </div>
                <div className="text-[8px] text-[#A7F3D0]/30">âœ“ DisponÃ­vel</div>
              </button>
            </div>
            <div className="mt-3 p-3 bg-[#0F2A1A]/30 rounded-xl border border-dashed border-[#34D399]/10">
              <p className="text-xs text-[#A7F3D0]/30 text-center">
                Em breve: ERP â€¢ Contabilidade â€¢ Cooperativa â€¢ Banco â€¢ API ContÃ¡bil
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
                      setMensagem(`âŒ O formato ${file.name.split('.').pop()} nÃ£o Ã© permitido no plano ${nomePlano}.`);
                      return;
                    }
                    setArquivo(file);
                    setMensagem("");
                    setResposta(null);
                    setEtapas([]);
                    setUploadError(null);
                    setUploadSuccess(false);
                  }
                }}
              />
              <label htmlFor="upload-arquivo" className="cursor-pointer block">
                <div className="text-3xl mb-2">ðŸ“‚</div>
                <p className="text-[#A7F3D0]/60 text-sm">
                  {arquivo ? arquivo.name : `Selecione o arquivo ${modoOrigem.toUpperCase()}`}
                </p>
                <p className="text-xs text-[#A7F3D0]/40 mt-1">
                  {modoOrigem === "excel" ? ".xlsx, .xls" : modoOrigem === "pdf" ? ".pdf" : ".csv"}
                </p>
              </label>
            </div>
          )}

          {/* FEEDBACK DE AUTENTICAÃ‡ÃƒO */}
          {isAuthenticated === false && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">FaÃ§a login para enviar arquivos.</p>
              <button
                onClick={() => (window.location.href = "/pt/login")}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition"
              >
                Fazer login
              </button>
            </div>
          )}

          {etapas.length > 0 && (
            <div className="bg-[#0F2A1A]/30 rounded-xl p-4 space-y-1 border border-[#34D399]/10">
              {etapas.map((etapa) => (
                <div key={etapa.id} className="flex items-center gap-2 text-xs text-[#A7F3D0]/60">
                  <span className="w-4">
                    {etapa.status === "concluido" && "âœ…"}
                    {etapa.status === "em_andamento" && "â³"}
                    {etapa.status === "pendente" && "â¬œ"}
                    {etapa.status === "erro" && "âŒ"}
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
              disabled={loading || isAuthenticated === false}
              className="w-full px-6 py-3 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50 text-sm"
            >
              {loading ? "â³ Processando..." : "ðŸš€ Enviar para o Motor Ï€"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}