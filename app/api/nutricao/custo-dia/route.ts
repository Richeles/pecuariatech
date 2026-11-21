import {
  getNutricaoContext,
  nutricaoJson,
} from "../_lib";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function unitInfo(unit: string | null | undefined) {
  switch (unit) {
    case "kg": return { group: "massa", factor: 1 };
    case "g": return { group: "massa", factor: 0.001 };
    case "t": return { group: "massa", factor: 1000 };
    case "l": return { group: "volume", factor: 1 };
    case "ml": return { group: "volume", factor: 0.001 };
    case "saco": return { group: "saco", factor: 1 };
    case "dose": return { group: "dose", factor: 1 };
    default: return null;
  }
}

export async function GET(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const { db, userId } = auth.context;
    const params = new URL(request.url).searchParams;
    const animalId = params.get("animal_id");

    if (animalId && !UUID.test(animalId)) {
      return nutricaoJson({ ok: false, error: "animal_id inválido." }, 400);
    }

    let query = db
      .from("nutricao_aplicacoes")
      .select("id,item_id,animal_id,piquete_id,dose_dia,unidade_dose,ativo", {
        count: "exact",
      })
      .eq("owner_id", userId)
      .eq("ativo", true)
      .order("data_inicio", { ascending: false })
      .limit(2000);

    if (animalId) {
      query = query.eq("animal_id", animalId);
    }

    const { data: applications, error, count } = await query;

    if (error) {
      console.error("[NUTRICAO][CUSTO-DIA][APPLICATIONS]", error.code);
      return nutricaoJson({ ok: false, error: "Falha ao consultar aplicações." }, 500);
    }

    const rows = applications ?? [];
    const itemIds = [...new Set(rows.map((row: any) => row.item_id))];

    let itens: any[] = [];

    if (itemIds.length > 0) {
      const result = await db
        .from("nutricao_itens")
        .select("id,nome,unidade_medida,custo_unitario_rs")
        .eq("owner_id", userId)
        .in("id", itemIds);

      if (result.error) {
        console.error("[NUTRICAO][CUSTO-DIA][ITEMS]", result.error.code);
        return nutricaoJson({ ok: false, error: "Falha ao consultar custos unitários." }, 500);
      }

      itens = result.data ?? [];
    }

    const itemMap = new Map(itens.map((item) => [item.id, item]));

    let partialTotal = 0;
    let calculated = 0;
    let pending = 0;

    const costRows = rows.map((application: any) => {
      const item = itemMap.get(application.item_id);
      const dose = Number(application.dose_dia);
      const price = item?.custo_unitario_rs;
      const doseUnit = unitInfo(application.unidade_dose);
      const itemUnit = unitInfo(item?.unidade_medida);

      let cost: number | null = null;
      let reason: string | null = null;

      if (!item) {
        reason = "Item não encontrado para o proprietário.";
      } else if (price === null || price === undefined || !Number.isFinite(Number(price))) {
        reason = "Custo unitário não informado.";
      } else if (!doseUnit || !itemUnit || doseUnit.group !== itemUnit.group) {
        reason = "Unidades incompatíveis; conversão não realizada.";
      } else if (!Number.isFinite(dose) || dose < 0) {
        reason = "Dose diária inválida.";
      } else {
        cost = round2(
          (dose * doseUnit.factor / itemUnit.factor) * Number(price)
        );

        partialTotal += cost;
        calculated += 1;
      }

      if (cost === null) {
        pending += 1;
      }

      return {
        aplicacao_id: application.id,
        item_id: application.item_id,
        item_nome: item?.nome ?? "Item não disponível",
        dose_dia: application.dose_dia,
        unidade_dose: application.unidade_dose,
        unidade_medida: item?.unidade_medida ?? null,
        custo_unitario_rs: item?.custo_unitario_rs ?? null,
        custo_nutricao_rs_dia: cost,
        calculavel: cost !== null,
        motivo_pendencia: reason,
      };
    });

    const totalRows = count ?? rows.length;
    const truncated = totalRows > rows.length;
    const complete = pending === 0 && !truncated;

    const partial = round2(partialTotal);

    return nutricaoJson({
      ok: true,
      data: {
        total: complete ? partial : null,
        custo_nutricao_rs_dia: complete ? partial : null,
        total_parcial_calculado: partial,
        calculo_completo: complete,
        aplicacoes_total: totalRows,
        aplicacoes_calculadas: calculated,
        aplicacoes_pendentes: pending + (truncated ? totalRows - rows.length : 0),
        limite_atingido: truncated,
        rows: costRows,
      },
    });
  } catch (error) {
    console.error("[NUTRICAO][CUSTO-DIA][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno ao calcular custo diário." }, 500);
  }
}