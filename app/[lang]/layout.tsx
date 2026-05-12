// app/[lang]/layout.tsx
// Next.js 16 App Router
// Runtime multilíngue PecuariaTech

import {
  ReactNode,
} from "react";

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;

  params: Promise<{
    lang: string;
  }>;
}) {

  /* ==========================================
     NEXT 16 PARAMS
  ========================================== */

  const {
    lang,
  } = await params;

  /* ==========================================
     SAFE LOCALE
  ========================================== */

  const safeLang =
    lang === "es"
      ? "es"
      : "pt";

  /* ==========================================
     LAYOUT
  ========================================== */

  return (

    <div
      lang={
        safeLang
      }
      data-lang={
        safeLang
      }
      suppressHydrationWarning
    >

      {children}

    </div>
  );
}