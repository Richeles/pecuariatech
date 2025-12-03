-- 0001_init.sql - schema + owner + planos
CREATE SCHEMA IF NOT EXISTS public;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id bigserial primary key,
  email text UNIQUE,
  password_hash text,
  is_owner boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.owner_settings (
  id bigserial primary key,
  key text,
  value jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.planos (
  id bigserial primary key,
  nome text NOT NULL,
  valor numeric NOT NULL,
  periodicidade text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_password text, p_is_owner boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.admin_users (email, password_hash, is_owner, created_at)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_is_owner, now())
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_owner = EXCLUDED.is_owner;
END;
$$;

-- Create owner via function call (will be idempotent)
SELECT public.create_admin_user('pecuariatech.br@gmail.com', 'UltraPecuaria123!', true);

-- Insert default planos (idempotent)
INSERT INTO public.planos (nome, valor, periodicidade, ativo, created_at) VALUES
  ('Mensal', 57.00, 'mensal', true, now()),
  ('Trimestral', 150.00, 'trimestral', true, now()),
  ('Anual', 547.20, 'anual', true, now())
ON CONFLICT (nome) DO NOTHING;

-- End of migration
