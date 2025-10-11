import dynamic from 'next/dynamic';
const UltraChat = dynamic(()=>import('../../components/UltraChat'),{ssr:false});
const UltraBiologico2 = dynamic(()=>import('../../components/UltraBiologico2'),{ssr:false});
export default function Page(){return (<main className='p-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-4'><div className='bg-white p-3 rounded shadow'><UltraChat/></div><div className='bg-white p-3 rounded shadow'><UltraBiologico2/></div></main>);}
