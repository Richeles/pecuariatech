export default function HomeLangPage({
  params,
}: {
  params: { lang: string };
}) {
  // Redireciona para home real
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/${params.lang}/planos'`,
        }}
      />
    </div>
  );
}