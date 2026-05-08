import { ReactNode } from "react";

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const safeLang =
    lang === "es" ? "es" : "pt";

  return (
    <html lang={safeLang}>
      <body>{children}</body>
    </html>
  );
}