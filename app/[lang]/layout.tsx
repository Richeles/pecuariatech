import { ReactNode } from "react";

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: "pt" | "es" }>;
}) {
  await params;

  return <>{children}</>;
}