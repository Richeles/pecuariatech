// lib/kpis/core.ts

export type CoreKPI = {
  title: string;
  value: string | number;
  variation?: string;
};

export async function getCoreKPIs(): Promise<CoreKPI[]> {
  return [
    {
      title: 'Receita',
      value: 'R$ 125.000',
      variation: '+12%',
    },
    {
      title: 'Rebanho',
      value: 842,
      variation: '+3%',
    },
    {
      title: 'Pastagem',
      value: '92%',
      variation: '+5%',
    },
    {
      title: 'Eficiência',
      value: '88%',
      variation: '+2%',
    },
  ];
}