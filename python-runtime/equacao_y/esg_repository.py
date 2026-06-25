from supabase_client import supabase

async def obter_esg(user_id: str):
    response = supabase.table("vw_esg") \
                      .select("*") \
                      .eq("user_id", user_id) \
                      .execute()
    if response.data:
        return response.data[0]
    return None
