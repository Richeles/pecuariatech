export default function RebanhoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card titulo="Total de Animais" valor="0" />
      <Card titulo="Matrizes" valor="0" />
      <Card titulo="Bezerros" valor="0" />
      <Card titulo="Machos" valor="0" />
    </div>
  );
}

function Card({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
    </div>
  );
}
