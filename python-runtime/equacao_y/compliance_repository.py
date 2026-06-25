from supabase_client import supabase

async def obter_compliance(user_id: str):
    response = supabase.table("vw_compliance") \
                      .select("*") \
                      .eq("user_id", user_id) \
                      .execute()
    if response.data:
        return response.data[0]
    return None
