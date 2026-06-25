"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

// ============================================================
// TRIÂNGULO 360 ULTRA PREMIUM
// Y (Verdade) + π (Motor) + ICBC (Capital Biológico) + X (Experiência)
// ============================================================

type LoteNutricao = {
  id: string;
  lote: string;
  peso_inicial: number;
  peso_atual: number;
  gmd: number;
  dias_confinamento: number;
  // Nutrição
  tipo_racao: string;
  suplemento: string;
  silagem: string;
  nutriente_principal: string;
  consumo_diario: number;
  // Metas
  meta_marmoreio: number;
  peso_ideal_abate: number;
  // Recomendações
  proteina_recomendada: number;
  energia_recomendada: number;
  calcio_recomendado: number;
  fosforo_recomendado: number;
  // Observações
  observacoes_nutricao: string;
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EditarNutricao() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [lote, setLote] = useState<LoteNutricao | null>(null);
  const [recomendacaoAtiva, setRecomendacaoAtiva] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Opções para selects
  const opcoesRacao = [
    "Silagem de Milho",
    "Silagem de Sorgo",
    "Feno",
    "Grão",
    "Concentrado",
    "Cana-de-açúcar",
    "Pastagem",
  ];
  const opcoesSuplemento = [
    "Mineral",
    "Proteico",
    "Energético",
    "Vitaminas",
    "Aminoácidos",
    "Lipídico",
  ];
  const opcoesSilagem = ["Milho", "Sorgo", "Capim", "Cana", "Aveia"];
  const opcoesNutriente = ["Proteína", "Energia", "Fibra", "Cálcio", "Fósforo"];

  // ============================================================
  // Y – CARREGAR DADOS REAIS (VERDADE)
  // ============================================================
  useEffect(() => {
    async function carregar() {
      try {
        // Tenta buscar da API existente
        const res = await fetch(`/api/engorda/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLote({
            id: data.id || id,
            lote: data.lote || "Lote " + id.slice(0, 8),
            peso_inicial: data.peso_inicial || 0,
            peso_atual: data.peso_atual || data.peso_inicial || 0,
            gmd: data.gmd || 0.8,
            dias_confinamento: data.dias_confinamento || 0,
            tipo_racao: data.tipo_racao || "",
            suplemento: data.suplemento || "",
            silagem: data.silagem || "",
            nutriente_principal: data.nutriente_principal || "",
            consumo_diario: data.consumo_diario || 0,
            meta_marmoreio: data.meta_marmoreio || 70,
            peso_ideal_abate: data.peso_ideal_abate || 540,
            proteina_recomendada: data.proteina_recomendada || 0,
            energia_recomendada: data.energia_recomendada || 0,
            calcio_recomendado: data.calcio_recomendado || 0,
            fosforo_recomendado: data.fosforo_recomendado || 0,
            observacoes_nutricao: data.observacoes_nutricao || "",
          });
        } else {
          // Fallback: criar dados mockados para teste
          setLote({
            id: id,
            lote: "Lote " + id.slice(0, 8),
            peso_inicial: 350,
            peso_atual: 420,
            gmd: 1.2,
            dias_confinamento: 60,
            tipo_racao: "Silagem de Milho",
            suplemento: "Mineral",
            silagem: "Milho",
            nutriente_principal: "Energia",
            consumo_diario: 10.5,
            meta_marmoreio: 70,
            peso_ideal_abate: 540,
            proteina_recomendada: 0,
            energia_recomendada: 0,
            calcio_recomendado: 0,
            fosforo_recomendado: 0,
            observacoes_nutricao: "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar lote:", error);
        // Fallback com dados mockados
        setLote({
          id: id,
          lote: "Lote " + id.slice(0, 8),
          peso_inicial: 350,
          peso_atual: 420,
          gmd: 1.2,
          dias_confinamento: 60,
          tipo_racao: "Silagem de Milho",
          suplemento: "Mineral",
          silagem: "Milho",
          nutriente_principal: "Energia",
          consumo_diario: 10.5,
          meta_marmoreio: 70,
          peso_ideal_abate: 540,
          proteina_recomendada: 0,
          energia_recomendada: 0,
          calcio_recomendado: 0,
          fosforo_recomendado: 0,
          observacoes_nutricao: "",
        });
      }
      setLoading(false);
    }
    if (id) carregar();
  }, [id]);

  // ============================================================
  // π – MOTOR DE CÁLCULO NUTRICIONAL
  // ============================================================
  const calcularRecomendacoes = () => {
    if (!lote) return;
    const peso = lote.peso_atual || lote.peso_inicial || 0;
    const gmd = lote.gmd || 0.8;

    // Consumo diário estimado: 2.5% do peso vivo
    const consumoEstimado = peso * 0.025;
    // Proteína: 12% do consumo
    const proteina = consumoEstimado * 0.12;
    // Energia: 2.5 Mcal/kg MS
    const energia = consumoEstimado * 2.5;
    // Cálcio: 0.6% do consumo
    const calcio = consumoEstimado * 0.006;
    // Fósforo: 0.3% do consumo
    const fosforo = consumoEstimado * 0.003;

    setLote({
      ...lote,
      consumo_diario: parseFloat(consumoEstimado.toFixed(1)),
      proteina_recomendada: parseFloat(proteina.toFixed(1)),
      energia_recomendada: parseFloat(energia.toFixed(1)),
      calcio_recomendado: parseFloat(calcio.toFixed(3)),
      fosforo_recomendado: parseFloat(fosforo.toFixed(3)),
    });
    setRecomendacaoAtiva(true);
  };

  // ============================================================
  // ICBC – ANÁLISE DE MARMOREIO
  // ============================================================
  const interpretacaoMarmoreio = (score: number) => {
    if (score >= 80) return { status: "EXCELENTE", cor: "text-emerald-400", desc: "Carcaça Premium" };
    if (score >= 60) return { status: "BOM", cor: "text-blue-400", desc: "Carcaça de alta qualidade" };
    if (score >= 40) return { status: "REGULAR", cor: "text-yellow-400", desc: "Carcaça comercial" };
    return { status: "BAIXO", cor: "text-red-400", desc: "Carcaça simples" };
  };

  // ============================================================
  // X – SUBSTITUIÇÕES INTELIGENTES
  // ============================================================
  const gerarSugestoes = (lote: LoteNutricao) => {
    const sugestoes = [];
    if (lote.tipo_racao === "Silagem de Milho") {
      sugestoes.push("Substitua por Silagem de Sorgo → maior fibra, menor custo");
    }
    if (lote.suplemento === "Mineral" && lote.gmd < 1.0) {
      sugestoes.push("Troque Mineral por Proteico → melhora ganho de peso");
    }
    if (lote.silagem === "Milho" && lote.meta_marmoreio > 70) {
      sugestoes.push("Use Silagem de Capim → reduz custo sem perder desempenho");
    }
    if (lote.consumo_diario < lote.peso_atual * 0.022) {
      sugestoes.push("Aumente o consumo diário para atingir 2.5% do peso vivo");
    }
    if (lote.meta_marmoreio < 60) {
      sugestoes.push("Aumente a meta de marmoreio para 70% para carcaça premium");
    }
    if (sugestoes.length === 0) {
      sugestoes.push("Dieta equilibrada – mantenha o protocolo atual");
    }
    return sugestoes;
  };

  // ============================================================
  // SALVAR
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lote) return;
    setSalvando(true);
    setMensagemSucesso("");
    try {
      const res = await fetch(`/api/engorda/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lote,
          user_id: "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
        }),
      });
      if (res.ok) {
        setMensagemSucesso("✅ Nutrição atualizada com sucesso!");
        setTimeout(() => {
          router.push("/pt/dashboard/engorda");
          router.refresh();
        }, 1500);
      } else {
        setMensagemSucesso("❌ Erro ao salvar. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao salvar nutrição:", error);
      setMensagemSucesso("❌ Erro ao conectar com o servidor.");
    }
    setSalvando(false);
  };

  // ============================================================
  // LOADING / ERRO
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A]">
        <div className="animate-pulse text-[#A7F3D0]/60">Carregando dados nutricionais...</div>
      </div>
    );
  }

  if (!lote) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#0F2A1A] p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <p className="text-red-400">Lote não encontrado.</p>
        </div>
      </div>
    );
  }

  const marmoreio = interpretacaoMarmoreio(lote.meta_marmoreio);
  const sugestoes = gerarSugestoes(lote);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="rounded-2xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌾</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Nutrição do Lote: {lote.lote}</h1>
              <p className="text-[#A7F3D0]/60 text-sm">
                Ajuste a dieta, suplementação e metas para otimizar desempenho e marmoreio.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-100">
                ● ONLINE
              </span>
              <span className="inline-flex rounded-full bg-[#34D399]/10 px-3 py-1 text-xs font-bold text-[#34D399]">
                Triângulo 360
              </span>
            </div>
          </div>
        </div>

        {mensagemSucesso && (
          <div className="rounded-xl p-4 bg-[#34D399]/10 border border-[#34D399]/20 text-center text-white">
            {mensagemSucesso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Y – DADOS DO LOTE */}
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="text-[#34D399]">📊</span> Dados do Lote
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Peso Médio</div>
                <div className="text-xl font-bold text-white">{lote.peso_atual?.toFixed(0) || 0} kg</div>
              </div>
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">GMD</div>
                <div className="text-xl font-bold text-white">{lote.gmd?.toFixed(2) || 0} kg/dia</div>
              </div>
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Dias Confinado</div>
                <div className="text-xl font-bold text-white">{lote.dias_confinamento || 0}</div>
              </div>
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Peso Ideal Abate</div>
                <div className="text-xl font-bold text-white">{lote.peso_ideal_abate || 540} kg</div>
              </div>
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Meta Marmoreio</div>
                <div className={`text-xl font-bold ${marmoreio.cor}`}>{lote.meta_marmoreio}%</div>
                <div className="text-xs text-[#A7F3D0]/40">{marmoreio.desc}</div>
              </div>
            </div>
          </div>

          {/* π – NUTRIÇÃO */}
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="text-[#34D399]">🌱</span> Dieta e Suplementação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#A7F3D0]/60">Tipo de Ração</label>
                <select
                  className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                  value={lote.tipo_racao || ""}
                  onChange={(e) => setLote({ ...lote, tipo_racao: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {opcoesRacao.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#A7F3D0]/60">Suplemento</label>
                <select
                  className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                  value={lote.suplemento || ""}
                  onChange={(e) => setLote({ ...lote, suplemento: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {opcoesSuplemento.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#A7F3D0]/60">Silagem</label>
                <select
                  className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                  value={lote.silagem || ""}
                  onChange={(e) => setLote({ ...lote, silagem: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {opcoesSilagem.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#A7F3D0]/60">Nutriente Principal</label>
                <select
                  className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                  value={lote.nutriente_principal || ""}
                  onChange={(e) => setLote({ ...lote, nutriente_principal: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {opcoesNutriente.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-[#A7F3D0]/60">Consumo Diário (kg MS)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    className="flex-1 bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                    value={lote.consumo_diario || 0}
                    onChange={(e) => setLote({ ...lote, consumo_diario: parseFloat(e.target.value) })}
                  />
                  <button
                    type="button"
                    onClick={calcularRecomendacoes}
                    className="px-4 py-2 rounded-xl bg-[#34D399]/20 text-[#34D399] font-bold hover:bg-[#34D399]/30 transition"
                  >
                    🔄 Calcular
                  </button>
                </div>
                <p className="text-xs text-[#A7F3D0]/40 mt-1">
                  ⚡ Clique em "Calcular" para obter recomendações automáticas
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-[#A7F3D0]/60">Observações Nutricionais</label>
                <textarea
                  className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60 resize-none"
                  rows={2}
                  placeholder="Detalhes sobre a dieta, ajustes, etc."
                  value={lote.observacoes_nutricao || ""}
                  onChange={(e) => setLote({ ...lote, observacoes_nutricao: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ICBC – RECOMENDAÇÕES */}
          <div className="rounded-2xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="text-[#34D399]">🧬</span> Recomendações Nutricionais
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Proteína (kg/dia)</div>
                <div className="text-xl font-bold text-white">{lote.proteina_recomendada?.toFixed(1) || 0}</div>
              </div>
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Energia (Mcal/dia)</div>
                <div className="text-xl font-bold text-white">{lote.energia_recomendada?.toFixed(1) || 0}</div>
              </div>
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Cálcio (kg/dia)</div>
                <div className="text-xl font-bold text-white">{lote.calcio_recomendado?.toFixed(3) || 0}</div>
              </div>
              <div className="bg-[#0F2A1A]/50 rounded-xl p-3 text-center border border-[#34D399]/10">
                <div className="text-xs text-[#A7F3D0]/50">Fósforo (kg/dia)</div>
                <div className="text-xl font-bold text-white">{lote.fosforo_recomendado?.toFixed(3) || 0}</div>
              </div>
            </div>
            {recomendacaoAtiva && (
              <div className="mt-3 p-3 rounded-xl bg-[#0F2A1A]/30 border border-[#34D399]/10">
                <p className="text-sm text-[#A7F3D0]/70">
                  <span className="font-bold text-white">📌 Sugestão:</span> 
                  {lote.gmd > 1.2 
                    ? " 🟢 Desempenho acima da média. Mantenha a dieta atual." 
                    : lote.gmd > 0.8 
                    ? " 🟡 Considere aumentar a densidade energética ou revisar o consumo." 
                    : " 🔴 Avalie a qualidade da ração e verifique a saúde do lote."}
                </p>
              </div>
            )}
          </div>

          {/* X – SUBSTITUIÇÕES */}
          <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span className="text-[#34D399]">🔄</span> Substituições Inteligentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sugestoes.map((sug, idx) => (
                <div key={idx} className="bg-[#0F2A1A]/50 rounded-xl p-3 border border-[#34D399]/10">
                  <div className="text-sm text-white">💡 {sug}</div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#34D399] to-[#10B981] text-[#0F2A1A] font-bold hover:scale-[1.02] transition shadow-lg shadow-[#34D399]/30 disabled:opacity-50"
            >
              {salvando ? "💾 Salvando..." : "💾 Salvar Nutrição"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-[#34D399]/20 text-[#A7F3D0]/70 hover:bg-[#34D399]/10 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}