import os
from supabase import create_client

# =========================================================
# CREDENCIAIS DO SUPABASE
# =========================================================
# Localmente, carrega variáveis de um arquivo .env, quando existir.
# Em produção (Render), usa as variáveis de ambiente configuradas
# no serviço. Não há credenciais hardcoded no código.

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception as e:
    print(f"⚠️ load_dotenv falhou: {e}")

# Pega as variáveis do ambiente
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Falha explicitamente se a configuração estiver ausente
if not SUPABASE_URL:
    raise RuntimeError("❌ NEXT_PUBLIC_SUPABASE_URL não configurada")

if not SUPABASE_KEY:
    raise RuntimeError("❌ SUPABASE_SERVICE_ROLE_KEY não configurada")

# Cria o cliente
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("✅ Supabase client inicializado com sucesso!")