<meta charSet='UTF-8' />
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar"; // âœ… Importando a Sidebar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PecuariaTech",
  description: "Sistema de GestÃ£o para PecuÃ¡ria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}>
        <Sidebar />
        <main className="ml-64 p-6 flex-1 bg-gray-50 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}









