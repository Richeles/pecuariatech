-- TABELAS BASE DO PECUARIATECH

create table if not exists public.pastagem (
  id bigint generated always as identity primary key,
  nome text not null,
  area_ha numeric,
  tipo_pasto text,
  qualidade text,
  latitude double precision,
  longitude double precision,
  created_at timestamp default now()
);

create table if not exists public.financeiro (
  id bigint generated always as identity primary key,
  descricao text not null,
  valor numeric not null,
  data date not null,
  categoria text
);

create table if not exists public.racas (
  id bigint generated always as identity primary key,
  raca text not null,
  cruzamento text,
  clima_ideal text,
  ganho_peso_dia numeric
);

create table if not exists public.dashboard (
  id bigint generated always as identity primary key,
  nome text,
  descricao text
);
