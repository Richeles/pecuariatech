import HomePage from "@/app/page";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const safeLang =
    lang === "es"
      ? "es"
      : "pt";

  return (
    <HomePage
      lang={safeLang}
    />
  );
}
