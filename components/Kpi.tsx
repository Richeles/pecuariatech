'use client';

interface KpiProps {
  title: string;
  value: number;
  emoji: string;
}

export default function Kpi({ title, value, emoji }: KpiProps) {
  return (
    <div className=" min-h-[100vh] flex flex-col" style={{ minHeight: "300px" }}>
      <div className=" min-h-[100vh] flex flex-col" style={{ minHeight: "300px" }}>{emoji}</div>
      <h3 className=" min-h-[100vh] flex flex-col">{title}</h3>
      <p className=" min-h-[100vh] flex flex-col">{value}</p>
    </div>
  );
}







