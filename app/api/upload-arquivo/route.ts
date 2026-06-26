import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import pdfParse from "pdf-parse";
import Papa from "papaparse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string; // rebanho, financeiro, pastagem, engorda
    const user_id = formData.get("user_id") as string || "96a1a441-c0f6-43b2-9cb7-4fadc17fd261";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let dados: any[] = [];

    // ============================================================
    // PROCESSAR EXCEL
    // ============================================================
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
      let workbook;
      if (file.name.endsWith(".csv")) {
        const text = buffer.toString("utf-8");
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        dados = result.data;
      } else {
        workbook = XLSX.read(buffer, { type: "buffer" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        dados = XLSX.utils.sheet_to_json(firstSheet);
      }
    }
    // ============================================================
    // PROCESSAR PDF
    // ============================================================
    else if (file.name.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;

      // Tentar extrair tabelas do PDF (formato simples: linhas com separadores)
      const linhas = text.split("\n").filter(line => line.trim().length > 0);
      const cabecalho = linhas[0]?.split(/\s{2,}|\t/) || [];
      const dadosLinhas = linhas.slice(1).map(line => line.split(/\s{2,}|\t/));

      if (cabecalho.length > 0 && dadosLinhas.length > 0) {
        dados = dadosLinhas.map(row => {
          const obj: any = {};
          cabecalho.forEach((key, i) => {
            obj[key.trim()] = row[i]?.trim() || "";
          });
          return obj;
        });
      } else {
        // Fallback: tentar parsear como CSV dentro do PDF
        const csvText = text.replace(/\s{2,}/g, ",");
        const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        dados = result.data;
      }
    } else {
      return NextResponse.json({ error: "Formato não suportado. Use .xlsx, .xls, .csv ou .pdf" }, { status: 400 });
    }

    // ============================================================
    // VALIDAR E INSERIR DADOS
    // ============================================================
    if (dados.length === 0) {
      return NextResponse.json({ error: "Nenhum dado encontrado no arquivo" }, { status: 400 });
    }

    const tabelas: Record<string, string> = {
      rebanho: "rebanho",
      financeiro: "movimentacoes",
      pastagem: "pastagem",
      engorda: "engorda",
    };

    const tabela = tabelas[tipo as keyof typeof tabelas];
    if (!tabela) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let inseridos = 0;
    let erros = 0;

    for (const linha of dados) {
      const registro = {
        ...linha,
        user_id,
        criado_em: new Date().toISOString(),
      };
      // Converter campos numéricos
      Object.keys(registro).forEach(key => {
        const val = registro[key];
        if (typeof val === "string" && !isNaN(parseFloat(val.replace(",", ".")))) {
          registro[key] = parseFloat(val.replace(",", "."));
        }
        if (key === "data_lancamento" || key === "vencimento" || key === "data_aplicacao" || key === "data_producao") {
          const d = new Date(val);
          if (!isNaN(d.getTime())) registro[key] = d.toISOString().split("T")[0];
        }
      });

      const { error } = await supabase.from(tabela).insert(registro);
      if (error) {
        erros++;
        console.error("[Upload] Erro ao inserir:", error);
      } else {
        inseridos++;
      }
    }

    return NextResponse.json({
      message: `✅ ${inseridos} registros importados com sucesso! ${erros > 0 ? `⚠️ ${erros} erros.` : ""}`,
      inseridos,
      erros,
    });
  } catch (error: any) {
    console.error("[Upload] Erro:", error);
    return NextResponse.json({ error: error.message || "Erro ao processar arquivo" }, { status: 500 });
  }
}