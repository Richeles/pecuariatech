import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo") || "rebanho";

  // Definir cabeçalhos e colunas para cada tipo
  const modelos: Record<string, { nome: string; colunas: string[] }> = {
    rebanho: {
      nome: "Modelo_Rebanho",
      colunas: ["brinco", "nome", "raca", "sexo", "peso_inicial", "lote", "data_entrada", "origem"],
    },
    financeiro: {
      nome: "Modelo_Financeiro",
      colunas: ["descricao", "tipo", "valor", "categoria", "data_lancamento"],
    },
    pastagem: {
      nome: "Modelo_Pastagem",
      colunas: ["nome", "area", "tipo_forragem", "capacidade_ua", "data_plantio", "status"],
    },
    engorda: {
      nome: "Modelo_Engorda",
      colunas: ["lote", "peso_inicial", "gmd", "duracao_dias", "data_inicio", "tipo_racao"],
    },
  };

  const modelo = modelos[tipo] || modelos.rebanho;

  // Gerar conteúdo CSV (compatível com Excel)
  const cabecalho = modelo.colunas.join(",");
  const linhaExemplo = modelo.colunas.map((col) => {
    if (col === "data_entrada" || col === "data_lancamento" || col === "data_plantio" || col === "data_inicio") {
      return "2025-01-01";
    }
    if (col === "sexo") return "M";
    if (col === "tipo") return "receita";
    if (col === "status") return "ativo";
    if (col === "area" || col === "peso_inicial" || col === "valor" || col === "gmd") return "0";
    return `exemplo_${col}`;
  }).join(",");

  const csv = `${cabecalho}\n${linhaExemplo}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${modelo.nome}.csv"`,
    },
  });
}