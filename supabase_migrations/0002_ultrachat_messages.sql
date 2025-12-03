-- 0002_ultrachat_messages.sql
CREATE TABLE IF NOT EXISTS public.ultrachat_messages (
  id bigserial PRIMARY KEY,
  user_name text NOT NULL,
  content text NOT NULL,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ultrachat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY if not exists public_insert ON public.ultrachat_messages
  FOR INSERT USING (true) WITH CHECK (true);

CREATE POLICY if not exists public_select ON public.ultrachat_messages
  FOR SELECT USING (true);

