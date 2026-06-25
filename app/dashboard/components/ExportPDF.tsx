"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Props = {
  dados: any;
  titulo: string;
};

export default function ExportPDF({ dados, titulo }: Props) {
  const [loading, setLoading] = useState(false);

  const gerarPDF = () => {
    setLoading(true);

    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text(`PecuariaTech - ${titulo}`, 14, 22);
      doc.setFontSize(12);
      doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

      // Tabela de indicadores
      const tableData = [
        ["Indicador", "Valor", "Interpretação", "Recomendação"],
        ["Score π", dados?.score_pi || 0, "Excelente", "Manter estratégia"],
        ["ROI", `${dados?.roi || 0}%`, "Retorno excepcional", "Expandir investimento"],
        ["Margem", `${dados?.margem || 0}%`, "Margem sólida", "Monitorar custos"],
        ["GMD", `${dados?.gmd || 0} kg/dia`, "Acima da média", "Manter dieta"],
        ["Lotação", `${dados?.lotacao || 0} UA/ha`, "Potencial de expansão", "Aumentar ocupação"],
      ];

      autoTable(doc, {
        head: [tableData[0]],
        body: tableData.slice(1),
        startY: 40,
        theme: "striped",
        headStyles: { fillColor: [52, 211, 153] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 60 },
        },
      });

      // Rodapé
      const finalY = (doc as any).lastAutoTable?.finalY || 100;
      doc.setFontSize(10);
      doc.text("Relatório gerado automaticamente pelo PecuariaTech", 14, finalY + 10);

      doc.save(`Relatorio_${titulo.replace(/\s/g, "_")}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Verifique o console.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={gerarPDF}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-[#34D399] text-[#0F2A1A] font-bold hover:bg-[#10B981] transition shadow-lg shadow-[#34D399]/30 disabled:opacity-50 text-sm flex items-center gap-2"
    >
      {loading ? "⏳ Gerando..." : "📄 Exportar PDF"}
    </button>
  );
}