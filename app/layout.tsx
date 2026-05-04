import "./globals.css";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>

        {/* 🌍 LANGUAGE SWITCHER GLOBAL (TODAS AS PÁGINAS) */}
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 9999,
          }}
        >
          <LanguageSwitcher />
        </div>

        {children}

      </body>
    </html>
  );
}