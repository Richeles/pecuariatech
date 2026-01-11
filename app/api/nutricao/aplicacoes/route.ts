// app/api/nutricao/aplicacoes/route.ts
// NUTRIÇÃO FASE 2 — Aplicações em animal ou piquete (CRUD)
// Segurança: Bearer token + RLS Supabase

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function supabaseFromReq(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const token = getBearerToken(req);

  return createClient(url, anon, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized: missing bearer token" }, { status: 401 });

  const supabase = supabaseFromReq(req);

  const { searchParams } = new URL(req.url);
  const animal_id = searchParams.get("animal_id");
  const piquete_id = searchParams.get("piquete_id");
  const ativo = searchParams.get("ativo"); // true/false
  const limit = Number(searchParams.get("limit") || 100);

  let query = supabase
    .from("nutricao_aplicacoes")
    .select("id,item_id,animal_id,piquete_id,quantidade,unidade,data_inicio,data_fim,observacao,ativo,criado_em,atualizado_em")
    .order("data_inicio", { ascending: false })
    .limit(Math.min(limit, 500));

  if (animal_id) query = query.eq("animal_id", animal_id);
  if (piquete_id) query = query.eq("piquete_id", piquete_id);
  if (ativo === "true") query = query.eq("ativo", true);
  if (ativo === "false") query = query.eq("ativo", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized: missing bearer token" }, { status: 401 });

  const supabase = supabaseFromReq(req);

  const body = await req.json().catch(() => null);
  if (!body?.item_id || !body?.data_inicio) {
    return NextResponse.json({ error: "Campos obrigatórios: item_id, data_inicio" }, { status: 400 });
  }

  // regra de alvo: precisa ter animal_id OU piquete_id
  if (!body?.animal_id && !body?.piquete_id) {
    return NextResponse.json({ error: "Informe animal_id ou piquete_id" }, { status: 400 });
  }

  const payload = {
    item_id: body.item_id,
    animal_id: body.animal_id ?? null,
    piquete_id: body.piquete_id ?? null,
    quantidade: body.quantidade ?? null,
    unidade: body.unidade ?? null,
    data_inicio: body.data_inicio,
    data_fim: body.data_fim ?? null,
    observacao: body.observacao ?? null,
    ativo: body.ativo ?? true,
  };

  const { data, error } = await supabase
    .from("nutricao_aplicacoes")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized: missing bearer token" }, { status: 401 });

  const supabase = supabaseFromReq(req);

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Campo obrigatório: id" }, { status: 400 });

  const id = String(body.id);

  const patch: Record<string, any> = {};
  if (body.item_id !== undefined) patch.item_id = body.item_id;
  if (body.animal_id !== undefined) patch.animal_id = body.animal_id;
  if (body.piquete_id !== undefined) patch.piquete_id = body.piquete_id;
  if (body.quantidade !== undefined) patch.quantidade = body.quantidade;
  if (body.unidade !== undefined) patch.unidade = body.unidade;
  if (body.data_inicio !== undefined) patch.data_inicio = body.data_inicio;
  if (body.data_fim !== undefined) patch.data_fim = body.data_fim;
  if (body.observacao !== undefined) patch.observacao = body.observacao;
  if (body.ativo !== undefined) patch.ativo = body.ativo;

  const { data, error } = await supabase
    .from("nutricao_aplicacoes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized: missing bearer token" }, { status: 401 });

  const supabase = supabaseFromReq(req);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Query param obrigatório: id" }, { status: 400 });

  // Soft delete (rastreiabilidade)
  const { data, error } = await supabase
    .from("nutricao_aplicacoes")
    .update({ ativo: false })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}
