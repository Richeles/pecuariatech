"use client";

import { useState } from "react";

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

  const processarArquivo = async (file: File) => {
    // Para Excel, o preview é feito no frontend (XLSX).
    // Para PDF, vamos enviar para a API e obter o preview.
    // Mas para simplificar, vamos apenas exibir uma mensagem.
    setArquivo(file);
    setMensagem(`📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB) - aguardando importação.`);
    // Podemos tentar ler Excel localmente para preview, mas manteremos simples.
  };

  const handleUpload = async () => {
    if (!arquivo) {
      setMensagem("❌ Selecione um arquivo primeiro.");
      return;
    }

    setLoading(true);
    try {
      const supabase = (await import("@/app/lib/supabase-browser")).createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const formData = new FormData();
      formData.append("file", arquivo);
      formData.append("tipo", tipo);
      formData.append("user_id", user?.id || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261");

      const res = await fetch("/api/upload-arquivo", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setMensagem(`✅ ${result.inseridos || 0} registros importados!`);
        setPreview([]);
        setArquivo(null);
        if (onSuccess) onSuccess();
      } else {
        setMensagem(`❌ Erro: ${result.error || "Falha ao importar"}`);
        if (onError) onError(result.error);
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
              accept=".xlsx,.xls,.csv,.pdf"
              className="hidden"
              id={`upload-${tipo}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processarArquivo(file);
              }}
            />
            <label htmlFor={`upload-${tipo}`} className="cursor-pointer block">
              <div className="text-3xl mb-2">📂</div>
              <p className="text-[#A7F3D0]/60 text-sm">
                {arquivo ? arquivo.name : `Clique para selecionar planilha ${tiposMap[tipo]}`}
              </p>
              <p className="text-xs text-[#A7F3D0]/40 mt-1">Formatos: .xlsx, .xls, .csv, .pdf</p>
            </label>
          </div>

          {arquivo && (
            <div className="bg-[#0F2A1A]/30 rounded-xl p-3">
              <p className="text-xs text-[#A7F3D0]/60">{mensagem}</p>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-2 px-4 py-2 rounded-lg bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition disabled:opacity-50 text-sm"
              >
                {loading ? "⏳ Importando..." : "🚀 Importar"}
              </button>
            </div>
          )}

          {mensagem && !arquivo && (
            <p className="text-xs text-[#A7F3D0]/60">{mensagem}</p>
          )}
        </div>
      )}
    </div>
  );
}