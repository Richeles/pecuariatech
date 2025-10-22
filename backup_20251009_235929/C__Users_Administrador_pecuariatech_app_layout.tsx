import './globals.css';
export const metadata = { title: 'PecuariaTech' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR'>
      <body className='bg-gray-50 text-gray-800'>
        <div className='flex min-h-screen'>
          <aside className='w-56 bg-emerald-700 text-white p-4 space-y-2'>
            <h2 className='text-xl font-bold mb-4'>ðŸŒ¿ PecuariaTech</h2>
            <a href='/dashboard' className='block'>ðŸ“Š Dashboard</a>
            <a href='/rebanho' className='block'>ðŸ„ Rebanho</a>
            <a href='/pastagem' className='block'>ðŸŒ± Pastagem</a>
            <a href='/ultrabiologica/status' className='block'>ðŸ§ª UltraBiolÃ³gica</a>
          </aside>
          <main className='flex-1 p-6'>{children}</main>
        </div>
      </body>
    </html>
  );
}





