import os
from supabase import create_client

# =========================================================
# DEFINIÇÃO DIRETA DAS CREDENCIAIS (fallback)
# =========================================================

# Tenta carregar do .env, mas se falhar, usa valores fixos
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=r"C:\Users\riche\pecuariatech-clean\python-runtime\.env", encoding='utf-8')
except Exception as e:
    print(f"⚠️ load_dotenv falhou: {e}")

# Pega as variáveis do ambiente
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Se não foram carregadas, usa os valores manuais
if not SUPABASE_URL:
    SUPABASE_URL = "https://kpzzekflqpoeccnqfkng.supabase.co"
    print("✅ SUPABASE_URL definido manualmente")

if not SUPABASE_KEY:
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwenpla2ZscXBvZWNjbnFma25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgwNzE1MiwiZXhwIjoyMDY2MzgzMTUyfQ.8zy_xc93iJVdrIPrdP-iy8XN9GlVWkE0epmrguca3iA"
    print("✅ SUPABASE_KEY definido manualmente")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Credenciais do Supabase não definidas!")

# Cria o cliente
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client inicializado com sucesso!")