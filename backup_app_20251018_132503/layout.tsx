import SWRegister from '../components/SWRegister'
import './globals.css';
export const metadata = { title: 'PecuariaTech', description: 'UltraBiológico & UltraChat' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR'>
      <head><meta charSet='utf-8' /><meta name='viewport' content='width=device-width,initial-scale=1' /></head>
      <body className='bg-gray-50 text-gray-800 min-h-screen'>
  <SWRegister/>{children}</body>
    </html>
  );
}


