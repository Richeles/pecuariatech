'use client';
<meta charSet='UTF-8' />
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Dashboard() {
  const { data, error } = useSWR('/api/ultra/stats', fetcher);

  if (error) return <div>Erro ao carregar dados.</div>;
  if (!data) return <div>Carregando...</div>;

  const k = data.kpis;
  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  Dashboard PecuariaTech</h1>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Kpi title='ÃƒÆ’Ã‚Ârea total (ha)' value={k.area_total_ha} emoji='ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¾' />
        <Kpi title='CabeÃƒÆ’Ã‚Â§as de gado' value={k.total_heads} emoji='ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬Å¾' />
        <Kpi title='Saldo (R$)' value={k.finance_sum?.toFixed(2)} emoji='ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â°' />
        <Kpi title='RaÃƒÆ’Ã‚Â§as' value={k.racas_count} emoji='ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â¬' />
      </div>
      <div className='bg-white shadow rounded p-4 mb-6'>
        <h2 className='text-lg font-semibold mb-2'>GrÃƒÆ’Ã‚Â¡fico Financeiro</h2>
        <div className='h-64 bg-gray-100 flex items-center justify-center'>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‹â€  em construÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o</div>
      </div>
      <div className='bg-white shadow rounded p-4'>
        <h2 className='text-lg font-semibold mb-2'>Tabela de Rebanho</h2>
        <div className='h-48 bg-gray-100 flex items-center justify-center'>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¹ em construÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o</div>
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












