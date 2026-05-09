import "./globals.css";
import { LanguageProvider } from "@/app/providers/LanguageProvider";

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