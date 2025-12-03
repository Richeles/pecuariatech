CREATE POLICY IF NOT EXISTS pastagem_public_read ON pastagem
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS rebanho_public_read ON rebanho
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS financeiro_public_read ON financeiro
  FOR SELECT USING (true);
