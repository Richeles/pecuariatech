import "./globals.css";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import AuthProviderWrapper from "@/app/providers/AuthProviderWrapper";

export const metadata = {
  title: "PecuariaTech",
  description:
    "Plataforma operacional cognitiva para gestão financeira, rebanho, pastagem, engorda e IA.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>
        <AuthProviderWrapper>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}