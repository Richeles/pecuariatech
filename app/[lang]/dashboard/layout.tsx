import { DashboardProvider } from "@/app/dashboard/DashboardContext";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LanguageSwitcher from "@/app/components/i18n/LanguageSwitcher";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { lang } = await params;

  const safeLang = lang === "es" ? "es" : "pt";

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", {
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/${safeLang}/login`);
  }

  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-[#0F2A1A]">
        <Sidebar lang={safeLang} />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}