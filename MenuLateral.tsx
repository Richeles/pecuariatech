'use client';
import Link from 'next/link';

export default function MenuLateral() {
  return (
    <aside className='w-64 bg-gray-800 text-white min-h-screen p-5'>
      <h2 className='text-2xl font-bold mb-8'>UltraAdmin</h2>
      <ul className='space-y-4'>
        <li><Link href='/admin' className='hover:text-green-400'>Dashboard</Link></li>
        <li><Link href='/admin/usuarios' className='hover:text-green-400'>Usuários</Link></li>
        <li><Link href='/admin/ultrabiologica' className='hover:text-green-400'>UltraBiológica</Link></li>
        <li><Link href='/admin/config' className='hover:text-green-400'>Configurações</Link></li>
      </ul>
    </aside>
  );
}

