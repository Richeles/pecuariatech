from supabase_client import supabase

async def obter_financeiro(user_id: str):
    try:
        response = supabase.table("vw_financeiro_resumo") \
                          .select("*") \
                          .eq("user_id", user_id) \
                          .execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"[Financeiro Repository] Erro: {e}")
        return None