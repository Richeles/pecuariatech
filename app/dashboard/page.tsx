'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Dashboard() {
  const { data, error } = useSWR('/api/ultra/stats', fetcher);

  if (error) return <div>Erro ao carregar dados.</div>;
  if (!data) return <div>Carregando...</div>;

  const k = data.kpis;
  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>ðŸ“Š Dashboard PecuariaTech</h1>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Kpi title='Ãrea total (ha)' value={k.area_total_ha} emoji='ðŸŒ¾' />
        <Kpi title='CabeÃ§as de gado' value={k.total_heads} emoji='ðŸ„' />
        <Kpi title='Saldo (R$)' value={k.finance_sum?.toFixed(2)} emoji='ðŸ’°' />
        <Kpi title='RaÃ§as' value={k.racas_count} emoji='ðŸ§¬' />
      </div>
      <div className='bg-white shadow rounded p-4 mb-6'>
        <h2 className='text-lg font-semibold mb-2'>GrÃ¡fico Financeiro</h2>
        <div className='h-64 bg-gray-100 flex items-center justify-center'>ðŸ“ˆ em construÃ§Ã£o</div>
      </div>
      <div className='bg-white shadow rounded p-4'>
        <h2 className='text-lg font-semibold mb-2'>Tabela de Rebanho</h2>
        <div className='h-48 bg-gray-100 flex items-center justify-center'>ðŸ“‹ em construÃ§Ã£o</div>
      </div>
    </div>
  );
}

function Kpi({ title, value, emoji }: { title: string, value: any, emoji: string }) {
  return (
    <div className='bg-white p-4 rounded shadow text-center'>
      <div className='text-3xl mb-2'>{emoji}</div>
      <div className='text-sm text-gray-500'>{title}</div>
      <div className='text-xl font-bold text-emerald-600'>{value ?? '-'}</div>
    </div>
  );
}





