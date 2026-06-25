from supabase_client import supabase

async def obter_icbc_historico(user_id: str):
    response = supabase.table("icbc_historico") \
                      .select("*") \
                      .eq("user_id", user_id) \
                      .order("mes", desc=False) \
                      .execute()
    if response.data:
        return response.data
    return []