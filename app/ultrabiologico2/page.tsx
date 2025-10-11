import dynamic from 'next/dynamic';
const UltraBiologico2 = dynamic(()=>import('../../components/UltraBiologico2'),{ssr:false});
export default function Page(){return (<main className='p-4 max-w-6xl mx-auto'><h1 className='text-2xl font-bold mb-4'>UltraBiológico 2.0</h1><UltraBiologico2/></main>);}
