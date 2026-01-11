// app/api/nutricao/itens/route.ts
// NUTRIÇÃO FASE 2 — Catálogo de itens (CRUD)
// Next.js 16 | App Router | Equação Y
// Segurança: Bearer token + RLS no Supabase

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
  const tipo = searchParams.get("tipo"); // suplemento | insumo | graminea
  const ativo = searchParams.get("ativo"); // true/false
  const q = searchParams.get("q"); // busca por nome

  let query = supabase
    .from("nutricao_itens")
    .select("id,nome,tipo,custo_unitario,unidade,observacao,ativo,criado_em,atualizado_em")
    .order("criado_em", { ascending: false });

  if (tipo) query = query.eq("tipo", tipo);
  if (ativo === "true") query = query.eq("ativo", true);
  if (ativo === "false") query = query.eq("ativo", false);
  if (q) query = query.ilike("nome", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized: missing bearer token" }, { status: 401 });

  const supabase = supabaseFromReq(req);

  const body = await req.json().catch(() => null);
  if (!body?.nome || !body?.tipo) {
    return NextResponse.json({ error: "Campos obrigatórios: nome, tipo" }, { status: 400 });
  }

  const payload = {
    nome: String(body.nome).trim(),
    tipo: String(body.tipo).trim(),
    custo_unitario: body.custo_unitario ?? null,
    unidade: body.unidade ?? null,
    observacao: body.observacao ?? null,
    ativo: body.ativo ?? true,
  };

  const { data, error } = await supabase
    .from("nutricao_itens")
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
  if (body.nome !== undefined) patch.nome = String(body.nome).trim();
  if (body.tipo !== undefined) patch.tipo = String(body.tipo).trim();
  if (body.custo_unitario !== undefined) patch.custo_unitario = body.custo_unitario;
  if (body.unidade !== undefined) patch.unidade = body.unidade;
  if (body.observacao !== undefined) patch.observacao = body.observacao;
  if (body.ativo !== undefined) patch.ativo = body.ativo;

  const { data, error } = await supabase
    .from("nutricao_itens")
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

  // Soft delete para rastreabilidade
  const { data, error } = await supabase
    .from("nutricao_itens")
    .update({ ativo: false })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}
