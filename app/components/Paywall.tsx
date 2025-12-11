export default function Paywall() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
      <p className="text-lg text-gray-700 mb-6">
        Para acessar este módulo, você precisa de um plano superior.
      </p>

      <a
        href="/planos"
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-xl rounded-xl"
      >
        Ver Planos Premium
      </a>
    </main>
  );
}
