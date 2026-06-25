from supabase_client import supabase

async def obter_rebanho(user_id: str):
    response = supabase.table("vw_rebanho") \
                      .select("*") \
                      .eq("user_id", user_id) \
                      .execute()
    if response.data:
        return response.data[0]
    return None
