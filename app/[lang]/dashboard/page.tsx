export default function DashboardPage({
  params,
}: {
  params: { lang: string };
}) {
  return <div>Dashboard ({params.lang})</div>;
}