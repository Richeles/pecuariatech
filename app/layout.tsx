import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className='flex min-h-screen bg-gray-100'>
      <aside className='w-64 bg-green-900 text-white p-6 space-y-6'>
        <h1 className='text-2xl font-bold'>PecuariaTech UltraPro</h1>
        <nav className='space-y-3'>
          <Link href='/dashboard' className='block hover:text-yellow-300'>Dashboard</Link>
          <Link href='/admin/usuarios' className='block hover:text-yellow-300'>Usuários</Link>
          <Link href='/admin/ultrabiologica' className='block hover:text-yellow-300'>UltraBiológica</Link>
          <Link href='/admin/config' className='block hover:text-yellow-300'>Configurações</Link>
        </nav>
      </aside>

      <main className='flex-1 p-10'>
        {children}
      </main>
    </div>
  );
}
