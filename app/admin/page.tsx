'use client';
import { useEffect, useState } from 'react';
import MenuLateral from './components/MenuLateral';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const ADMIN_EMAIL = 'admin@pecuariatech.com';

  // Cria sessão automática
  useEffect(() => {
    if (!localStorage.getItem('session')) {
      localStorage.setItem('session', JSON.stringify({ user: { email: ADMIN_EMAIL } }));
    }
  }, []);

  function getClientSession() {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('session') || 'null');
    } catch { return null; }
  }

  useEffect(() => {
    const s = getClientSession();
    setSession(s);
    if (!s) { router.push('/login'); return; }
    if (s.user?.email !== ADMIN_EMAIL) { router.push('/acesso-negado'); return; }
  }, []);

  if (!session) return (
    <div className='p-10 text-center text-xl font-semibold'>Carregando sessão...</div>
  );

  // Dashboard básico com KPIs
  return (
    <div className='flex'>
      <MenuLateral />
      <main className='flex-1 p-10 bg-gray-900 text-white min-h-screen'>
        <h1 className='text-4xl font-bold mb-6'>Dashboard Admin</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-400 cursor-pointer'>
            <h2 className='text-2xl font-semibold mb-2'>📊 KPIs</h2>
            <p>Visualize métricas do sistema.</p>
          </div>
          <div className='bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-400 cursor-pointer'>
            <h2 className='text-2xl font-semibold mb-2'>🧪 UltraBiológica</h2>
            <p>Status e monitoramento do UltraBiológica Cloud.</p>
          </div>
          <div className='bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-green-400 cursor-pointer'>
            <h2 className='text-2xl font-semibold mb-2'>👥 Usuários</h2>
            <p>Gerencie contas e permissões.</p>
          </div>
        </div>

        <div className='mt-10'>
          <h2 className='text-3xl font-bold mb-4'>Alertas Automáticos</h2>
          <p>⚡ Integração futura com WhatsApp/Telegram para alertas em tempo real.</p>
        </div>
      </main>
    </div>
  );
}
