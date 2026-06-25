"use client";

type Props = {
  insights?: string[];
};

export default function PastagemAIInsights({ insights = [] }: Props) {
  const defaultInsights = [
    "📈 Potencial de expansão identificado",
    "🌱 Recomenda-se rotação de pastagem",
    "💧 Monitorar irrigação nos próximos dias",
  ];

  const items = insights.length > 0 ? insights : defaultInsights;

  return (
    <div className="rounded-2xl border border-[#34D399]/20 bg-[#1A3F2A]/60 backdrop-blur-sm p-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <span className="text-[#34D399]">🤖</span> Insights de IA
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="bg-[#0F2A1A]/50 rounded-xl p-4 border border-[#34D399]/10">
            <p className="text-[#A7F3D0]/80 text-sm">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}