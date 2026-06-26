// app/dashboard/components/UploadPlanilha.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

type Props = {
  tipo: "rebanho" | "financeiro" | "pastagem" | "engorda";
  onSuccess?: () => void;
  onError?: (msg: string) => void;
};

export default function UploadPlanilha({ tipo, onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

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

  const handleUpload = async () => {
    if (preview.length === 0) {
      setMensagem("❌ Nenhum dado para enviar.");
      return;
    }

    setLoading(true);
    try {
      const supabase = (await import("@/app/lib/supabase-browser")).createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch("/api/planilha-operacional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          dados: preview,
          user_id: user?.id || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261",
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMensagem(`✅ ${result.processados || preview.length} registros importados!`);
        setPreview([]);
        setArquivo(null);
        if (onSuccess) onSuccess();
      } else {
        setMensagem(`❌ Erro: ${result.message || "Falha ao importar"}`);
        if (onError) onError(result.message);
      }
    } catch (error) {
      console.error("Erro ao importar:", error);
      setMensagem("❌ Erro de conexão com o servidor.");
    }
    setLoading(false);
  };

  const tiposMap = {
    rebanho: "Rebanho",
    financeiro: "Financeiro",
    pastagem: "Pastagem",
    engorda: "Engorda",
  };

  return (
    <div className="bg-[#1A3F2A]/60 rounded-2xl border border-[#34D399]/20 p-4 backdrop-blur-sm">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm font-bold text-[#34D399] hover:text-[#10B981] transition flex items-center gap-2"
      >
        {showForm ? "✕ Fechar Importação" : `📤 Importar Dados ${tiposMap[tipo]}`}
      </button>

      {showForm && (
        <div className="mt-4 space-y-4">
          <div className="border-2 border-dashed border-[#34D399]/20 rounded-xl p-4 text-center hover:border-[#34D399]/40 transition cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              id={`upload-${tipo}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setArquivo(file);
                  processarArquivo(file);
                }
              }}
            />
            <label htmlFor={`upload-${tipo}`} className="cursor-pointer block">
              <div className="text-3xl mb-2">📂</div>
              <p className="text-[#A7F3D0]/60 text-sm">
                {arquivo ? arquivo.name : `Clique para selecionar planilha ${tiposMap[tipo]}`}
              </p>
              <p className="text-xs text-[#A7F3D0]/40 mt-1">Formatos: .xlsx, .xls, .csv</p>
            </label>
          </div>

          {preview.length > 0 && (
            <div className="bg-[#0F2A1A]/30 rounded-xl p-3 max-h-48 overflow-auto">
              <p className="text-xs text-[#A7F3D0]/60">{mensagem}</p>
              <div className="mt-2 text-xs text-[#A7F3D0]/40">
                <span className="font-medium text-white">Preview:</span> {preview.length} registros
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="ml-4 px-4 py-1 rounded-lg bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50 text-xs"
                >
                  {loading ? "⏳ Importando..." : "🚀 Importar"}
                </button>
              </div>
            </div>
          )}

          {mensagem && !preview.length && (
            <p className="text-xs text-[#A7F3D0]/60">{mensagem}</p>
          )}
        </div>
      )}
    </div>
  );
}