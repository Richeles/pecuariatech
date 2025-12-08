Write-Host "⚙️ [NÚCLEO OPERACIONAL] Criando layout e menu..."

@"
export const MENU = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Rebanho', href: '/rebanho' },
  { name: 'Pastagem', href: '/pastagem' },
  { name: 'Financeiro', href: '/financeiro' },
  { name: 'UltraBiológica', href: '/ultrabiologica' },
  { name: 'UltraChat', href: '/ultrachat' },
  { name: 'Configurações', href: '/config' }
];
"@ | Set-Content "src/lib/menu.ts"

@"
import { MENU } from '@/lib/menu';

export default function RootLayout({ children }) {
  return (
    <html>
      <body className='flex'>
        <aside className='w-64 p-4 border-r'>
          {MENU.map(m => <a key={m.href} href={m.href}>{m.name}</a>)}
        </aside>
        <main className='flex-1 p-6'>{children}</main>
      </body>
    </html>
  );
}
"@ | Set-Content "src/app/layout.tsx"

Write-Host "⚙️ [NÚCLEO OPERACIONAL] Layout pronto."
