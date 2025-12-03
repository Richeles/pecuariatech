-- apply_pecuariatech.sql
-- Tabelas e funções principais do projeto

CREATE TABLE IF NOT EXISTS public.racas (id bigserial primary key, raca text, clima_ideal text, ganho_peso_dia numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.rebanho (id bigserial primary key, nome text, raca text, peso_kg numeric, data_nascimento date, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.pastagem (id bigserial primary key, nome text, area_ha numeric, tipo_pasto text, qualidade text, latitude numeric, longitude numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.planos (id bigserial primary key, nome text NOT NULL, valor numeric NOT NULL, periodicidade text NOT NULL, ativo boolean default true, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.admin_users (id bigserial primary key, email text unique, password_hash text, is_owner boolean default false, created_at timestamptz default now());

CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_is_owner boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql AS \$\$
BEGIN
  INSERT INTO public.admin_users (email, password_hash, is_owner, created_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_is_owner, now())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_owner = EXCLUDED.is_owner;
END;
\$\$;
