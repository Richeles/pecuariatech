export default function Dashboard() {
  return (
    <div>
      <h1 className='text-3xl font-bold mb-6'>Dashboard UltraPro</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white p-6 shadow rounded-xl'>
          <h2 className='text-xl font-semibold'>Rebanho Total</h2>
          <p className='text-4xl font-bold mt-2 text-green-700'>128</p>
        </div>
        <div className='bg-white p-6 shadow rounded-xl'>
          <h2 className='text-xl font-semibold'>Área da Fazenda</h2>
          <p className='text-4xl font-bold mt-2 text-blue-700'>240 ha</p>
        </div>
        <div className='bg-white p-6 shadow rounded-xl'>
          <h2 className='text-xl font-semibold'>Financeiro</h2>
          <p className='text-4xl font-bold mt-2 text-yellow-700'>R$ 52.800</p>
        </div>
      </div>

      <h2 className='text-2xl font-bold mt-10'>Gráfico Financeiro</h2>
      <p className='text-gray-600'>Gráfico dinâmico será integrado em breve.</p>
    </div>
  );
}
