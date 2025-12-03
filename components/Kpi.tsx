'use client';

interface KpiProps {
  title: string;
  value: number;
  emoji: string;
}

export default function Kpi({ title, value, emoji }: KpiProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center border border-gray-200">
      <div className="text-3xl mb-2">{emoji}</div>
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <p className="text-xl font-bold text-green-700">{value}</p>
    </div>
  );
}



