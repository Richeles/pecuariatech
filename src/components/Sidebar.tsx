import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white fixed">
      <div className="p-6 font-bold text-xl border-b border-gray-700">PecuariaTech</div>
      <nav className="mt-6">
        <ul>
          <li className="p-4 hover:bg-gray-700"><Link href="/dashboard">Dashboard</Link></li>
          <li className="p-4 hover:bg-gray-700"><Link href="/financeiro">Financeiro</Link></li>
          <li className="p-4 hover:bg-gray-700"><Link href="/rebanho">Rebanho</Link></li>
          <li className="p-4 hover:bg-gray-700"><Link href="/pastagem">Pastagem</Link></li>
        </ul>
      </nav>
    </aside>
  );
}



