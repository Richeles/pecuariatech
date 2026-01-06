"use client";

type Props = {
  title: string;
  value: number | string;
};

export function KpiReal({ title, value }: Props) {
  return (
    <div
      style={{
        background: "#145a32",
        borderRadius: 16,
        padding: 24,
        minWidth: 220,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      <p style={{ fontSize: 14, opacity: 0.85 }}>{title}</p>
      <strong style={{ fontSize: 28 }}>{value}</strong>
    </div>
  );
}
