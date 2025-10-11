-- create_ultrabiologico_full.sql
create table if not exists public.chat_messages (
  id bigserial primary key,
  role text,
  text text,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists public.rebanho (
  id bigserial primary key,
  nome text,
  raca text,
  peso_kg numeric,
  data_nascimento date,
  created_at timestamptz default now()
);

create table if not exists public.pastagem (
  id bigserial primary key,
  nome text,
  area_ha numeric,
  tipo_pasto text,
  qualidade text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz default now()
);

create table if not exists public.nutricao (
  id bigserial primary key,
  descricao text,
  energia numeric,
  proteina numeric,
  fibra numeric,
  created_at timestamptz default now()
);

create table if not exists public.clima_readings (
  id bigserial primary key,
  pasture_id bigint,
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.actions (
  id bigserial primary key,
  source text,
  action jsonb,
  result jsonb,
  created_at timestamptz default now()
);
