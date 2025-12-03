import { cookies } from "next/headers";

export async function createServerClient() {
  const cookieStore = await cookies();

  return {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? null;
      },
    },
  };
}
