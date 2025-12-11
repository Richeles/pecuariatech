import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// =====================================================
// ROTA /api/relatorio/pdf
// Gera PDF simples (compativel com Vercel Node Runtime)
// =====================================================

export const runtime = "nodejs"; // IMPORTANTE PARA EVITAR ERRO NO VERCEL

export async function GET(req: Request) {
  try {
    // Dados fictícios para teste inicial
    const titulo = "Relatório Premium PecuariaTech";
    const texto =
      "Este é o relatório Premium gerado pela PecuariaTech.\n\n" +
      "Inclui indicadores financeiros, UltraBiológica 360° e resumo operacional.\n\n" +
      "PDF básico gerado com compatibilidade total com Vercel.";

    // Criar PDF manualmente (formato mínimo)
    const pdfContent = `
      %PDF-1.3
      1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
      2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
      3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]
      /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
      4 0 obj <</Length  ${texto.length + 60}>> stream
      BT /F1 18 Tf 50 780 Td (${titulo}) Tj
      0 -30 Td (${texto.replace(/\n/g, ") Tj 0 -20 Td (")}) Tj
      ET
      endstream endobj
      5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
      xref
      0 6
      0000000000 65535 f 
      0000000010 00000 n 
      0000000060 00000 n 
      0000000113 00000 n 
      0000000270 00000 n 
      0000000520 00000 n 
      trailer <</Size 6 /Root 1 0 R>>
      startxref
      600
      %%EOF
    `;

    return new Response(pdfContent, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio_premium.pdf"`,
      },
    });
  } catch (e) {
    console.error("Erro PDF:", e);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}
