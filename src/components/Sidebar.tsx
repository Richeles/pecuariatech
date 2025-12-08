'use client';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className=" min-h-[100vh]">
      <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>PecuariaTech</div>
      <nav className=" min-h-[100vh]">
        <ul>
          <li className=" min-h-[100vh]"><Link href="/dashboard">Dashboard</Link></li>
          <li className=" min-h-[100vh]"><Link href="/financeiro">Financeiro</Link></li>
          <li className=" min-h-[100vh]"><Link href="/rebanho">Rebanho</Link></li>
          <li className=" min-h-[100vh]"><Link href="/pastagem">Pastagem</Link></li>
        </ul>
      </nav>
    </aside>
  );
}










