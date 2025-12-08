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
