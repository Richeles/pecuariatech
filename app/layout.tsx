import "./globals.css";
import { LanguageProvider } from "@/app/providers/LanguageProvider";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LanguageProvider>

        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
          }}
        >
          <LanguageSwitcher />
        </div>

        {children}

      </LanguageProvider>
    </>
  );
}