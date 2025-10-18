import UltraChat from '../../components/UltraChat';
import UltraBiologico2 from '../../components/UltraBiologico2';
export default function Page(){
  return (<main className='p-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-4'><div className='bg-white p-3 rounded shadow'><UltraChat/></div><div className='bg-white p-3 rounded shadow'><UltraBiologico2/></div></main>);
}
