-- TABELA PRINCIPAL
create table if not exists animal (
  id uuid primary key default gen_random_uuid(),
  brinco_propriedade text not null,
  brinco_origem text not null,
  origem text,
  data_nascimento date,
  sexo text,
  raca text,
  vacinas jsonb,
  procedencia text,
  criado_em timestamp default now(),
  atualizado_em timestamp default now()
);

create table if not exists animal_piquete (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references animal(id),
  entrada timestamp,
  saida timestamp,
  numero_piquete text,
  criado_em timestamp default now()
);

create table if not exists animal_confinamento (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references animal(id),
  entrada timestamp,
  saida timestamp,
  lote text,
  criado_em timestamp default now()
);

create table if not exists animal_alimentacao (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references animal(id),
  data timestamp,
  tipo text,
  quantidade text,
  criado_em timestamp default now()
);

create table if not exists animal_tratamento (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references animal(id),
  data timestamp,
  tipo text,
  produto text,
  dose text,
  observacao text,
  criado_em timestamp default now()
);
