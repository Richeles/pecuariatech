export default function LoginPage({
  params,
}: {
  params: { lang: string };
}) {
  return <div>Login ({params.lang})</div>;
}