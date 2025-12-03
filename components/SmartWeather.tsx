"use client";

interface Props {
  temp: number | null;
  cond: string;
}

export default function SmartWeather({ temp, cond }: Props) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-md mt-3">
      <h2 className="text-lg font-semibold text-green-700 mb-1">🌦️  Clima Atual</h2>
      <p className="text-gray-700">
        {cond} — {temp !== null ? `${temp}°C` : '---'}
      </p>
    </div>
  );
}
