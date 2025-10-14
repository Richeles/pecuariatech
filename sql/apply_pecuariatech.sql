-- Tabelas principais
CREATE TABLE IF NOT EXISTS public.chat_messages (id bigserial primary key, role text, text text, meta jsonb, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.racas (id bigserial primary key, raca text, clima_ideal text, ganho_peso_dia numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.rebanho (id bigserial primary key, nome text, raca text, peso_kg numeric, data_nascimento date, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.pastagem (id bigserial primary key, nome text, area_ha numeric, tipo_pasto text, qualidade text, latitude numeric, longitude numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.nutricao (id bigserial primary key, descricao text, energia numeric, proteina numeric, fibra numeric, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.clima_readings (id bigserial primary key, pasture_id bigint, payload jsonb, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.planos (id bigserial primary key, nome text NOT NULL, valor numeric NOT NULL, periodicidade text NOT NULL, ativo boolean default true, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.admin_users (id bigserial primary key, email text unique, password_hash text, is_owner boolean default false, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.owner_settings (id bigserial primary key, key text, value jsonb, created_at timestamptz default now());
CREATE TABLE IF NOT EXISTS public.actions (id bigserial primary key, source text, action jsonb, result jsonb, created_at timestamptz default now());

-- Funções
CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_is_owner boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql AS \$\$
BEGIN
  INSERT INTO public.admin_users (email, password_hash, is_owner, created_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_is_owner, now())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_owner = EXCLUDED.is_owner;
END;
\$\$;

CREATE OR REPLACE FUNCTION public.owner_unlock(p_password text)
RETURNS TABLE(key text, value jsonb) LANGUAGE plpgsql AS \$\$
BEGIN
  RETURN QUERY
  SELECT os.key, os.value
  FROM public.owner_settings os
  WHERE EXISTS (
    SELECT 1 FROM public.admin_users a
    WHERE a.is_owner = true AND a.password_hash = crypt(p_password, a.password_hash)
  );
END;
\$\$;

CREATE INDEX IF NOT EXISTS idx_rebanho_raca ON public.rebanho (raca);
