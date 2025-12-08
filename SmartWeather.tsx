"use client";

interface Props {
  temp: number | null;
  cond: string;
}

export default function SmartWeather({ temp, cond }: Props) {
  return (
    <div className=" min-h-[100vh]" style={{ minHeight: "300px" }}>
      <h2 className=" min-h-[100vh]">🌦️  Clima Atual</h2>
      <p className=" min-h-[100vh]">
        {cond} — {temp !== null ? `${temp}°C` : '---'}
      </p>
    </div>
  );
}


