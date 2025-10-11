-- create_ultrabiologico2_full.sql
create table if not exists public.chat_messages (id serial primary key, role text, message text, ts timestamp default now());
create table if not exists public.rebanho (id serial primary key, nome text, raca text, peso_kg numeric, idade int, created_at timestamp default now());
create table if not exists public.pastagem (id serial primary key, nome text, area_ha numeric, tipo_pasto text, qualidade text, latitude numeric, longitude numeric, created_at timestamp default now());
