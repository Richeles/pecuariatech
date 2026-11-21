import {
  getNutricaoContext,
  nutricaoJson,
} from "../_lib";

const TIPOS = [
  "MINERAL",
  "PROTEINADO",
  "ENERGETICO",
  "NUCLEO",
  "RACAO",
  "CONCENTRADO",
  "VOLUMOSO",
  "FORRAGEM",
  "GRAMINEA",
  "OUTRO",
];

const UNIDADES = ["kg", "g", "t", "l", "ml", "saco", "dose"];

const FIELDS =
  "id,nome,tipo,marca,unidade_medida,custo_unitario_rs,pb_percent,ndt_percent,energia_mcal_kg,observacao,ativo,criado_em,atualizado_em";

class ValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildPayload(body: Record<string, unknown>, creating: boolean) {
  const payload: Record<string, unknown> = {};

  if (creating || body.nome !== undefined) {
    if (typeof body.nome !== "string" || !body.nome.trim()) {
      throw new ValidationError("Informe o nome do item.");
    }

    payload.nome = body.nome.trim();
  }

  if (creating || body.tipo !== undefined) {
    if (typeof body.tipo !== "string") {
      throw new ValidationError("Informe o tipo do item.");
    }

    const tipo = body.tipo.trim().toUpperCase();

    if (!TIPOS.includes(tipo)) {
      throw new ValidationError("Tipo nutricional inválido.");
    }

    payload.tipo = tipo;
  }

  if (creating && body.unidade_medida === undefined) {
    payload.unidade_medida = "kg";
  } else if (body.unidade_medida !== undefined) {
    if (typeof body.unidade_medida !== "string") {
      throw new ValidationError("Unidade de medida inválida.");
    }

    const unidade = body.unidade_medida.trim().toLowerCase();

    if (!UNIDADES.includes(unidade)) {
      throw new ValidationError("Unidade de medida não permitida.");
    }

    payload.unidade_medida = unidade;
  }

  for (const field of ["marca", "observacao"]) {
    if (body[field] === undefined) continue;

    const value = body[field];

    if (value !== null && typeof value !== "string") {
      throw new ValidationError(`Campo inválido: ${field}`);
    }

    payload[field] = value === null ? null : (value as string).trim() || null;
  }

  const numericFields: Record<string, number | null> = {
    custo_unitario_rs: null,
    pb_percent: 100,
    ndt_percent: 100,
    energia_mcal_kg: null,
  };

  for (const [field, maximum] of Object.entries(numericFields)) {
    if (body[field] === undefined) continue;

    const value = body[field];

    if (value === null || value === "") {
      payload[field] = null;
      continue;
    }

    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      number < 0 ||
      (maximum !== null && number > maximum)
    ) {
      throw new ValidationError(`Valor numérico inválido: ${field}`);
    }

    payload[field] = number;
  }

  if (creating && body.ativo === undefined) {
    payload.ativo = true;
  } else if (body.ativo !== undefined) {
    if (typeof body.ativo !== "boolean") {
      throw new ValidationError("Campo ativo deve ser booleano.");
    }

    payload.ativo = body.ativo;
  }

  return payload;
}

function validarId(id: string | null): id is string {
  return Boolean(
    id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

export async function GET(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const { userId, db } = auth.context;
    const params = new URL(request.url).searchParams;

    const tipo = params.get("tipo")?.trim().toUpperCase();
    const ativo = params.get("ativo");
    const busca = params.get("q");

    if (ativo !== null && !["true", "false"].includes(ativo)) {
      return nutricaoJson({ ok: false, error: "Filtro ativo inválido." }, 400);
    }

    let query = db
      .from("nutricao_itens")
      .select(FIELDS)
      .eq("owner_id", userId)
      .order("criado_em", { ascending: false });

    if (tipo) {
      if (!TIPOS.includes(tipo)) {
        return nutricaoJson({ ok: false, error: "Tipo inválido." }, 400);
      }
      query = query.eq("tipo", tipo);
    }

    if (ativo !== null) {
      query = query.eq("ativo", ativo === "true");
    }

    if (busca) {
      query = query.ilike("nome", `%${busca}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[NUTRICAO][ITENS][GET]", error.code);
      return nutricaoJson({ ok: false, error: "Falha ao consultar itens." }, 500);
    }

    return nutricaoJson({ ok: true, data: data ?? [] });
  } catch (error) {
    console.error("[NUTRICAO][ITENS][GET][INTERNAL]", error);
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

    const payload = buildPayload(body, true);

    const { data, error } = await auth.context.db
      .from("nutricao_itens")
      .insert({
        ...payload,
        owner_id: auth.context.userId,
      })
      .select(FIELDS)
      .single();

    if (error) {
      console.error("[NUTRICAO][ITENS][POST]", error.code);
      return nutricaoJson({ ok: false, error: "Não foi possível cadastrar o item." }, 500);
    }

    return nutricaoJson({ ok: true, data }, 201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return nutricaoJson({ ok: false, error: error.message }, 400);
    }

    console.error("[NUTRICAO][ITENS][POST][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno." }, 500);
  }
}

export async function PUT(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const body = await request.json().catch(() => null);

    if (!isRecord(body) || !validarId(String(body.id ?? ""))) {
      return nutricaoJson({ ok: false, error: "Identificador inválido." }, 400);
    }

    const payload = buildPayload(body, false);

    if (Object.keys(payload).length === 0) {
      return nutricaoJson({ ok: false, error: "Nenhum campo informado." }, 400);
    }

    const { data, error } = await auth.context.db
      .from("nutricao_itens")
      .update({
        ...payload,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", String(body.id))
      .eq("owner_id", auth.context.userId)
      .select(FIELDS)
      .maybeSingle();

    if (error) {
      console.error("[NUTRICAO][ITENS][PUT]", error.code);
      return nutricaoJson({ ok: false, error: "Falha ao atualizar item." }, 500);
    }

    if (!data) {
      return nutricaoJson({ ok: false, error: "Item não encontrado." }, 404);
    }

    return nutricaoJson({ ok: true, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return nutricaoJson({ ok: false, error: error.message }, 400);
    }

    console.error("[NUTRICAO][ITENS][PUT][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno." }, 500);
  }
}

export async function DELETE(request: Request) {
  const auth = await getNutricaoContext(request);
  if (auth.ok === false) return auth.response;

  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!validarId(id)) {
      return nutricaoJson({ ok: false, error: "Identificador inválido." }, 400);
    }

    const { data, error } = await auth.context.db
      .from("nutricao_itens")
      .update({
        ativo: false,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_id", auth.context.userId)
      .select(FIELDS)
      .maybeSingle();

    if (error) {
      console.error("[NUTRICAO][ITENS][DELETE]", error.code);
      return nutricaoJson({ ok: false, error: "Falha ao inativar item." }, 500);
    }

    if (!data) {
      return nutricaoJson({ ok: false, error: "Item não encontrado." }, 404);
    }

    return nutricaoJson({ ok: true, data });
  } catch (error) {
    console.error("[NUTRICAO][ITENS][DELETE][INTERNAL]", error);
    return nutricaoJson({ ok: false, error: "Erro interno." }, 500);
  }
}