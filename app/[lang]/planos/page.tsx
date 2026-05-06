import PlanosClient from "@/app/planos/PlanosClient";

export default function Page({
  params,
}: {
  params: { lang: string };
}) {
  return <PlanosClient />;
}