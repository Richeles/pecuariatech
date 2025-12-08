'use client';

interface KpiProps {
  title: string;
  value: number;
  emoji: string;
}

export default function Kpi({ title, value, emoji }: KpiProps) {
  return (
    <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>
      <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>{emoji}</div>
      <h3 className=" min-h-[100vh]">{title}</h3>
      <p className=" min-h-[100vh]">{value}</p>
    </div>
  );
}





