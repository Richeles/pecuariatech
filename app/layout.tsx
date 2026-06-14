import "./globals.css";
import { LanguageProvider } from "@/app/providers/LanguageProvider";

export const metadata = {
  title: "PecuariaTech",
  description: "Plataforma operacional cognitiva para gestão financeira, rebanho, pastagem, engorda e IA.",
  manifest: "/manifest.json",   // ← esta linha ativa o PWA
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}