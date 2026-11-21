import {
  getNutricaoContext,
  nutricaoJson,
} from "../_lib";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const UNIDADES_DOSE = ["kg", "g", "dose", "saco", "l", "ml"];

class ValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validarUuid(value: unknown, field: string): string {
  if (typeof value !== "string" || !UUID.test(value)) {
    throw new ValidationError(`Identificador inválido: ${field}`);
  }
  return value;
}

function optionalUuid(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  return validarUuid(value, field);
}

function validarData(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(`Data inválida: ${field}`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new ValidationError(`Data inválida: ${field}`);
  }

  return value;
}

function validarDose(value: unknown): number {
  const number = Number(value);

  if (value === null || value === undefined || value === "" || !Number.isFinite(number) || number < 0) {
    throw new ValidationError("Dose diária inválida.");
  }

  return number;
}

function validarUnidade(value: unknown): string {
  const unidade = String(value ?? "kg").trim().toLowerCase();

  if (!UNIDADES_DOSE.includes(unidade)) {
    throw new ValidationError("Unidade de dose não permitida.");
  }

  return unidade;
}

async function validarItem(
  db: any,
  userId: string,
  itemId: string,
  exigirAtivo: boolean
) {
  const { data, error } = await db
    .from("nutricao_itens")
    .select("id,nome,unidade_medida,custo_unitario_rs,ativo")
    .eq("id", itemId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw new Error("Falha ao validar item nutricional.");
  if (!data) throw new ValidationError("Item não pertence ao usuário.");
  if (exigirAtivo && !data.ativo) {
    throw new ValidationError("O item nutricional está inativo.");
  }

  return data;
}

async function validarAlvo(
  db: any,
  userId: string,
  animalId: string | null,
  piqueteId: string | null
) {
  if (Boolean(animalId) === Boolean(piqueteId)) {
    throw new ValidationError(
      "Informe exatamente um alvo: animal ou piquete."
    );
  }

  if (animalId) {
    const { data, error } = await db
      .from("animais")
      .select("id")
      .eq("id", animalId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error("Falha ao validar propriedade do animal.");
    if (!data) throw new ValidationError("Animal não encontrado para este usuário.");
  }

  if (piqueteId) {
    const { data: piquete, error } = await db
      .from("piquetes")
      .select("id,user_id,pastagem_id")
      .eq("id", piqueteId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error("Falha ao validar propriedade do piquete.");
    if (!piquete) throw new ValidationError("Piquete não encontrado para este usuário.");

    if (piquete.pastagem_id) {
      const { data: pastagem, error: pastagemError } = await db
        .from("pastagem")
        .select("id")
        .eq("id", piquete.pastagem_id)
        .eq("user_id", userId)
        .maybeSingle();

      if (pastagemError) throw new Error("Falha ao validar a pastagem do piquete.");
      if (!pastagem) {
        throw new ValidationError("A pastagem vinculada não pertence ao usuário.");
      }
    }
  }
}

function validarObservacao(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new ValidationError("Observação inválida.");
  }
  return value.trim() || null;
}

function validarAtivo(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new ValidationError("Campo ativo deve ser booleano.");
  }
  return value;
}

export async function GET(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const { db, userId } = auth.context;
    const params = new URL(request.url).searchParams;

    const animalId = params.get("animal_id");
    const piqueteId = params.get("piquete_id");
    const ativo = params.get("ativo");
    const limitRaw = Number(params.get("limit") ?? 100);

    if (!Number.isInteger(limitRaw) || limitRaw < 1) {
      return nutricaoJson({ ok: false, error: "Limite inválido." }, 400);
    }

    if (ativo !== null && !["true", "false"].includes(ativo)) {
      return nutricaoJson({ ok: false, error: "Filtro ativo inválido." }, 400);
    }

    if (animalId && !UUID.test(animalId)) {
      return nutricaoJson({ ok: false, error: "animal_id inválido." }, 400);
    }

    if (piqueteId && !UUID.test(piqueteId)) {
      return nutricaoJson({ ok: false, error: "piquete_id inválido." }, 400);
    }

    let query = db
      .from("nutricao_aplicacoes")
      .select("id,owner_id,item_id,animal_id,piquete_id,dose_dia,unidade_dose,data_inicio,data_fim,observacao,ativo,criado_em,atualizado_em")
      .eq("owner_id", userId)
      .order("data_inicio", { ascending: false })
      .limit(Math.min(limitRaw, 500));

    if (animalId) query = query.eq("animal_id", animalId);
    if (piqueteId) query = query.eq("piquete_id", piqueteId);
    if (ativo !== null) query = query.eq("ativo", ativo === "true");

    const { data, error } = await query;

    if (error) {
      console.error("[NUTRICAO][APLICACOES][GET]", error.code);
      return nutricaoJson({ ok: false, error: "Falha ao consultar aplicações." }, 500);
    }

    const rows = data ?? [];
    const itemIds = [...new Set(rows.map((row: any) => row.item_id))];

    let itens: any[] = [];

    if (itemIds.length > 0) {
      const result = await db
        .from("nutricao_itens")
        .select("id,nome,unidade_medida,custo_unitario_rs")
        .eq("owner_id", userId)
        .in("id", itemIds);

      if (result.error) {
        console.error("[NUTRICAO][APLICACOES][ITEMS]", result.error.code);
        return nutricaoJson({ ok: false, error: "Falha ao consultar itens vinculados." }, 500);
      }

      itens = result.data ?? [];
    }

    const itemMap = new Map(itens.map((item) => [item.id, item]));

    const enriched = rows.map((row: any) => {
      const item = itemMap.get(row.item_id);

      return {
        ...row,
        item_nome: item?.nome ?? "Item não disponível",
        item_unidade_medida: item?.unidade_medida ?? null,
        item_custo_unitario_rs: item?.custo_unitario_rs ?? null,
      };
    });

    return nutricaoJson({ ok: true, data: enriched });
  } catch (error) {
    console.error("[NUTRICAO][APLICACOES][GET][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno." }, 500);
  }
}

export async function POST(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const body = await request.json().catch(() => null);

    if (!isRecord(body)) {
      return nutricaoJson({ ok: false, error: "Corpo inválido." }, 400);
    }

    const { db, userId } = auth.context;

    const itemId = validarUuid(body.item_id, "item_id");
    const animalId = optionalUuid(body.animal_id, "animal_id");
    const piqueteId = optionalUuid(body.piquete_id, "piquete_id");

    await validarItem(db, userId, itemId, true);
    await validarAlvo(db, userId, animalId, piqueteId);

    const dataInicio = validarData(body.data_inicio, "data_inicio");
    const dataFim =
      body.data_fim === null || body.data_fim === undefined || body.data_fim === ""
        ? null
        : validarData(body.data_fim, "data_fim");

    if (dataFim && dataFim < dataInicio) {
      throw new ValidationError("data_fim não pode ser anterior a data_inicio.");
    }

    const ativo = body.ativo === undefined ? true : validarAtivo(body.ativo);

    const payload = {
      owner_id: userId,
      item_id: itemId,
      animal_id: animalId,
      piquete_id: piqueteId,
      dose_dia: validarDose(body.dose_dia),
      unidade_dose: validarUnidade(body.unidade_dose),
      data_inicio: dataInicio,
      data_fim: dataFim,
      observacao: validarObservacao(body.observacao),
      ativo,
    };

    const { data, error } = await db
      .from("nutricao_aplicacoes")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("[NUTRICAO][APLICACOES][POST]", error.code);
      return nutricaoJson({ ok: false, error: "Não foi possível cadastrar a aplicação." }, 500);
    }

    return nutricaoJson({ ok: true, data }, 201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return nutricaoJson({ ok: false, error: error.message }, 400);
    }

    console.error("[NUTRICAO][APLICACOES][POST][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno." }, 500);
  }
}

export async function PUT(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const body = await request.json().catch(() => null);

    if (!isRecord(body) || typeof body.id !== "string" || !UUID.test(body.id)) {
      return nutricaoJson({ ok: false, error: "Identificador inválido." }, 400);
    }

    const { db, userId } = auth.context;

    const { data: existing, error: readError } = await db
      .from("nutricao_aplicacoes")
      .select("*")
      .eq("id", body.id)
      .eq("owner_id", userId)
      .maybeSingle();

    if (readError) throw new Error("Falha ao consultar aplicação.");
    if (!existing) {
      return nutricaoJson({ ok: false, error: "Aplicação não encontrada." }, 404);
    }

    const itemId =
      body.item_id === undefined
        ? existing.item_id
        : validarUuid(body.item_id, "item_id");

    const animalId =
      body.animal_id === undefined
        ? existing.animal_id
        : optionalUuid(body.animal_id, "animal_id");

    const piqueteId =
      body.piquete_id === undefined
        ? existing.piquete_id
        : optionalUuid(body.piquete_id, "piquete_id");

    await validarItem(db, userId, itemId, body.item_id !== undefined);
    await validarAlvo(db, userId, animalId, piqueteId);

    const dataInicio =
      body.data_inicio === undefined
        ? existing.data_inicio
        : validarData(body.data_inicio, "data_inicio");

    const dataFim =
      body.data_fim === undefined
        ? existing.data_fim
        : body.data_fim === null || body.data_fim === ""
          ? null
          : validarData(body.data_fim, "data_fim");

    if (dataFim && dataFim < dataInicio) {
      throw new ValidationError("data_fim não pode ser anterior a data_inicio.");
    }

    const patch: Record<string, unknown> = {
      atualizado_em: new Date().toISOString(),
    };

    if (body.item_id !== undefined) patch.item_id = itemId;
    if (body.animal_id !== undefined) patch.animal_id = animalId;
    if (body.piquete_id !== undefined) patch.piquete_id = piqueteId;
    if (body.dose_dia !== undefined) patch.dose_dia = validarDose(body.dose_dia);
    if (body.unidade_dose !== undefined) patch.unidade_dose = validarUnidade(body.unidade_dose);
    if (body.data_inicio !== undefined) patch.data_inicio = dataInicio;
    if (body.data_fim !== undefined) patch.data_fim = dataFim;
    if (body.observacao !== undefined) patch.observacao = validarObservacao(body.observacao);
    if (body.ativo !== undefined) patch.ativo = validarAtivo(body.ativo);

    if (Object.keys(patch).length === 1) {
      return nutricaoJson({ ok: false, error: "Nenhum campo informado." }, 400);
    }

    const { data, error } = await db
      .from("nutricao_aplicacoes")
      .update(patch)
      .eq("id", body.id)
      .eq("owner_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[NUTRICAO][APLICACOES][PUT]", error.code);
      return nutricaoJson({ ok: false, error: "Falha ao atualizar aplicação." }, 500);
    }

    if (!data) {
      return nutricaoJson({ ok: false, error: "Aplicação não encontrada." }, 404);
    }

    return nutricaoJson({ ok: true, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return nutricaoJson({ ok: false, error: error.message }, 400);
    }

    console.error("[NUTRICAO][APLICACOES][PUT][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno." }, 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id || !UUID.test(id)) {
      return nutricaoJson({ ok: false, error: "Identificador inválido." }, 400);
    }

    const { data, error } = await auth.context.db
      .from("nutricao_aplicacoes")
      .update({
        ativo: false,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_id", auth.context.userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[NUTRICAO][APLICACOES][DELETE]", error.code);
      return nutricaoJson({ ok: false, error: "Falha ao inativar aplicação." }, 500);
    }

    if (!data) {
      return nutricaoJson({ ok: false, error: "Aplicação não encontrada." }, 404);
    }

    return nutricaoJson({ ok: true, data });
  } catch (error) {
    console.error("[NUTRICAO][APLICACOES][DELETE][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno." }, 500);
  }
}