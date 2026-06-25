"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function PlanilhaOperacional() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [tipoDado, setTipoDado] = useState<string>("rebanho");
  const [mensagem, setMensagem] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const processarArquivo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet);
        setPreview(json);
        setMensagem(`📄 ${json.length} registros encontrados.`);
      } catch (error) {
        setMensagem("❌ Erro ao ler o arquivo. Verifique o formato.");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const enviarDados = async () => {
    if (preview.length === 0) {
      setMensagem("❌ Nenhum dado para enviar.");
      return;
    }

    setLoading(true);
    setStatus("loading");

    try {
      const response = await fetch("/api/planilha-operacional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipoDado,
          dados: preview,
          user_id: "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMensagem(`✅ ${result.processados || preview.length} registros importados com sucesso!`);
        setTimeout(() => {
          router.push("/pt/dashboard");
          router.refresh();
        }, 2000);
      } else {
        setStatus("error");
        setMensagem(`❌ Erro: ${result.message || "Falha ao importar"}`);
      }
    } catch (error) {
      setStatus("error");
      setMensagem("❌ Erro de conexão com o servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const mapeamentos = {
    rebanho: {
      obrigatorios: ["brinco", "nome", "peso_inicial"],
      opcionais: ["raca", "sexo", "lote", "data_entrada", "origem"],
    },
    financeiro: {
      obrigatorios: ["descricao", "tipo", "valor"],
      opcionais: ["data_lancamento", "categoria"],
    },
    pastagem: {
      obrigatorios: ["nome", "area"],
      opcionais: ["tipo_forragem", "data_plantio"],
    },
    engorda: {
      obrigatorios: ["lote", "peso_inicial"],
      opcionais: ["gmd", "duracao_dias", "data_inicio"],
    },
  };

  const nomesTipo: Record<string, string> = {
    rebanho: "Rebanho",
    financeiro: "Financeiro",
    pastagem: "Pastagem",
    engorda: "Engorda",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F2A1A] via-[#1A3F2A] to-[#0F2A1A] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border border-[#34D399]/20 bg-gradient-to-br from-[#1A3F2A]/90 to-[#0F2A1A] p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-white">Planilha Operacional</h1>
              <p className="text-[#A7F3D0]/60 text-sm">
                Importe dados da propriedade de forma massiva via planilha Excel/CSV.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-100">
                ● ONLINE
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#A7F3D0]/60">Tipo de Dado</label>
              <select
                className="w-full bg-[#0F2A1A]/70 border border-[#34D399]/20 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#34D399]/60"
                value={tipoDado}
                onChange={(e) => setTipoDado(e.target.value)}
              >
                <option value="rebanho">🐄 Rebanho</option>
                <option value="financeiro">💰 Financeiro</option>
                <option value="pastagem">🌱 Pastagem</option>
                <option value="engorda">⚡ Engorda</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-[#A7F3D0]/60">📥 Baixar Modelo</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.keys(mapeamentos).map((tipo) => (
                  <a
                    key={tipo}
                    href={`/api/modelo?tipo=${tipo}`}
                    download
                    className={`text-xs px-3 py-1 rounded-full border transition ${
                      tipo === tipoDado
                        ? "bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40"
                        : "bg-[#0F2A1A]/50 text-[#A7F3D0]/60 border-[#34D399]/10 hover:bg-[#34D399]/10 hover:text-[#34D399]"
                    }`}
                  >
                    📄 Modelo {nomesTipo[tipo] || tipo}
                  </a>
                ))}
              </div>
              <p className="text-xs text-[#A7F3D0]/40 mt-1">
                Clique para baixar um arquivo CSV com as colunas necessárias.
              </p>
            </div>

            <div>
              <label className="text-sm text-[#A7F3D0]/60">Arquivo (Excel/CSV)</label>
              <div className="border-2 border-dashed border-[#34D399]/20 rounded-xl p-8 text-center hover:border-[#34D399]/40 transition cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setArquivo(file);
                      processarArquivo(file);
                    }
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📂</div>
                  <p className="text-[#A7F3D0]/60">
                    {arquivo ? arquivo.name : "Clique para selecionar ou arraste o arquivo"}
                  </p>
                  <p className="text-xs text-[#A7F3D0]/40 mt-1">
                    Formatos: .xlsx, .xls, .csv
                  </p>
                </label>
              </div>
            </div>

            <div className="bg-[#0F2A1A]/50 rounded-xl p-4 border border-[#34D399]/10">
              <p className="text-xs text-[#A7F3D0]/50">
                📌 Campos obrigatórios para <strong className="text-white">{nomesTipo[tipoDado]}</strong>:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {mapeamentos[tipoDado as keyof typeof mapeamentos].obrigatorios.map((campo) => (
                  <span key={campo} className="text-xs bg-[#34D399]/20 text-[#34D399] px-3 py-1 rounded-full">
                    {campo}
                  </span>
                ))}
              </div>
            </div>

            {preview.length > 0 && (
              <div className="rounded-xl border border-[#34D399]/10 bg-[#0F2A1A]/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">📋 Preview ({preview.length} registros)</h4>
                  <button
                    onClick={enviarDados}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50 text-sm"
                  >
                    {loading ? "⏳ Importando..." : "🚀 Importar Dados"}
                  </button>
                </div>
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0F2A1A]/50">
                      <tr>
                        {Object.keys(preview[0] || {}).map((key) => (
                          <th key={key} className="p-2 text-left text-[#A7F3D0]/50 font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="border-t border-[#34D399]/5">
                          {Object.values(row).map((val: any, i) => (
                            <td key={i} className="p-2 text-[#A7F3D0]/80">
                              {String(val).slice(0, 30)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <p className="text-xs text-[#A7F3D0]/40 text-center mt-2">
                      + {preview.length - 10} registros
                    </p>
                  )}
                </div>
              </div>
            )}

            {mensagem && (
              <div className={`rounded-xl p-4 text-center ${
                status === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" :
                status === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" :
                "bg-[#34D399]/10 border border-[#34D399]/20 text-[#A7F3D0]/80"
              }`}>
                {mensagem}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}