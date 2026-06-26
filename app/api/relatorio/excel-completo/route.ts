// app/api/relatorio/excel-completo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, dados } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ============================================================
    // BUSCAR DADOS REAIS (ou usar os recebidos)
    // ============================================================

    // Financeiro resumido
    const { data: financeiro } = await supabase
      .from("vw_financeiro_resumo")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    // Movimentações
    const { data: movimentacoes } = await supabase
      .from("movimentacoes")
      .select("*")
      .eq("user_id", user_id)
      .order("data_lancamento", { ascending: true });

    // Rebanho
    const { data: rebanho } = await supabase
      .from("rebanho")
      .select("*")
      .eq("user_id", user_id);

    // Vacinas
    const { data: vacinas } = await supabase
      .from("vacinas")
      .select("*")
      .eq("user_id", user_id);

    // Silagem
    const { data: silagem } = await supabase
      .from("silagem")
      .select("*")
      .eq("user_id", user_id);

    // Contas
    const { data: contas } = await supabase
      .from("contas")
      .select("*")
      .eq("user_id", user_id)
      .order("vencimento", { ascending: true });

    // ============================================================
    // MONTAR PLANILHA EXCEL
    // ============================================================
    const workbook = XLSX.utils.book_new();

    // ABA 1 – Resumo Executivo
    const resumo = [
      ["INDICADOR", "VALOR"],
      ["ROI", `${dados?.roi || 0}%`],
      ["Margem", `${dados?.margem || 0}%`],
      ["EBITDA", `R$ ${(dados?.ebitda || 0).toLocaleString()}`],
      ["Score π", dados?.score_pi || 0],
      ["Capital Score", dados?.capital_score || 0],
      ["GMD", `${dados?.gmd || 0} kg/dia`],
      ["Lotação", `${dados?.lotacao || 0} UA/ha`],
      ["Risco", dados?.risco_estrutural || "N/D"],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
    wsResumo["!cols"] = [{ wch: 30 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, wsResumo, "Resumo");

    // ABA 2 – DRE
    const dre = [
      ["DESCRIÇÃO", "VALOR (R$)"],
      ["Receita Bruta", financeiro?.receita_bruta || 0],
      ["(-) Custos Operacionais", financeiro?.custo_operacional || 0],
      ["(=) EBITDA", financeiro?.ebitda || 0],
      ["(-) Depreciação", financeiro?.depreciacao || 0],
      ["(=) EBIT", financeiro?.ebit || 0],
      ["(-) Juros", financeiro?.juros || 0],
      ["(=) Lucro Líquido", financeiro?.lucro_liquido || 0],
    ];
    const wsDre = XLSX.utils.aoa_to_sheet(dre);
    wsDre["!cols"] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, wsDre, "DRE");

    // ABA 3 – Movimentações
    if (movimentacoes && movimentacoes.length > 0) {
      const mov = [
        ["DATA", "DESCRIÇÃO", "TIPO", "VALOR (R$)"],
        ...movimentacoes.map((m: any) => [
          new Date(m.data_lancamento).toLocaleDateString("pt-BR"),
          m.descricao,
          m.tipo,
          m.valor,
        ]),
      ];
      const wsMov = XLSX.utils.aoa_to_sheet(mov);
      wsMov["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, wsMov, "Movimentações");
    }

    // ABA 4 – Contas a Pagar
    if (contas) {
      const pagar = contas.filter((c: any) => c.tipo === "pagar");
      const sheet = [
        ["VENCIMENTO", "DESCRIÇÃO", "VALOR (R$)", "FORNECEDOR", "STATUS"],
        ...pagar.map((c: any) => [
          new Date(c.vencimento).toLocaleDateString("pt-BR"),
          c.descricao,
          c.valor,
          c.fornecedor || "-",
          c.status || "pendente",
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(sheet);
      ws["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, ws, "Contas a Pagar");

      // ABA 5 – Contas a Receber
      const receber = contas.filter((c: any) => c.tipo === "receber");
      const sheet2 = [
        ["VENCIMENTO", "DESCRIÇÃO", "VALOR (R$)", "CLIENTE", "STATUS"],
        ...receber.map((c: any) => [
          new Date(c.vencimento).toLocaleDateString("pt-BR"),
          c.descricao,
          c.valor,
          c.cliente || "-",
          c.status || "pendente",
        ]),
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(sheet2);
      ws2["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, ws2, "Contas a Receber");
    }

    // ABA 6 – Rebanho
    if (rebanho) {
      const reb = [
        ["DATA", "ANIMAL", "TIPO", "QUANTIDADE", "VALOR UNITÁRIO", "TOTAL"],
        ...rebanho.map((r: any) => [
          new Date(r.data_movimentacao).toLocaleDateString("pt-BR"),
          r.animal_id || r.brinco,
          r.tipo_movimentacao,
          r.quantidade || 1,
          r.valor_unitario || 0,
          r.valor_total || 0,
        ]),
      ];
      const wsReb = XLSX.utils.aoa_to_sheet(reb);
      wsReb["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, wsReb, "Rebanho");
    }

    // ABA 7 – Vacinas
    if (vacinas) {
      const vac = [
        ["DATA", "PRODUTO", "TIPO", "LOTE", "QUANTIDADE", "CUSTO (R$)"],
        ...vacinas.map((v: any) => [
          new Date(v.data_aplicacao).toLocaleDateString("pt-BR"),
          v.produto,
          v.tipo,
          v.lote || "-",
          v.quantidade,
          v.custo_unitario || 0,
        ]),
      ];
      const wsVac = XLSX.utils.aoa_to_sheet(vac);
      wsVac["!cols"] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, wsVac, "Vacinas");
    }

    // ABA 8 – Silagem
    if (silagem) {
      const sil = [
        ["DATA", "TIPO", "QUANTIDADE (ton)", "VALOR (R$)"],
        ...silagem.map((s: any) => [
          new Date(s.data_producao).toLocaleDateString("pt-BR"),
          s.tipo,
          s.quantidade,
          s.valor,
        ]),
      ];
      const wsSil = XLSX.utils.aoa_to_sheet(sil);
      wsSil["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, wsSil, "Silagem");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=relatorio_completo_${new Date().toISOString().slice(0,10)}.xlsx`,
      },
    });
  } catch (error: any) {
    console.error("[Relatório Completo] Erro:", error);
    return NextResponse.json({ error: error.message || "Erro ao gerar relatório" }, { status: 500 });
  }
}