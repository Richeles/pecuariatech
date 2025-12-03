<meta charSet='UTF-8' />
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-green-100">
      <h1 className="text-4xl font-bold text-green-800">
        ðŸ„ Bem-vindo ao PecuariaTech
      </h1>
      <p className="mt-4 text-lg text-green-700">
        GestÃ£o inteligente para sua fazenda!
      </p>

      <div className="flex flex-col gap-4 mt-8">
        <a
          href="/dashboard"
          className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          Acessar Dashboard
        </a>
        <a
          href="/financeiro"
          className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          Acessar Financeiro
        </a>
        <a
          href="/rebanho"
          className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          Acessar Rebanho
        </a>
        <a
          href="/pastagem"
          className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          Acessar Pastagem
        </a>
      </div>
    </main>
  );
}









