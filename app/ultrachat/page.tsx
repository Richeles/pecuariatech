import dynamic from 'next/dynamic';
const UltraChat = dynamic(()=>import('../../components/UltraChat'),{ssr:false});
export default function Page(){return (<main className='p-4 max-w-4xl mx-auto'><h1 className='text-2xl font-bold mb-4'>UltraChat</h1><UltraChat/></main>);}
