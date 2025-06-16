export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">UseBem</h1>
        <p className="text-gray-600 text-lg">
          Descubra como usar melhor seus cartões e programas de pontos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <a href="/cards" className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Meus Cartões</h2>
            <p className="text-sm text-gray-500">Cadastre os cartões que você possui.</p>
          </a>

          <a href="/benefits" className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Programas</h2>
            <p className="text-sm text-gray-500">Gerencie os programas de fidelidade que participa.</p>
          </a>

          <a href="/dashboard" className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Consultar IA</h2>
            <p className="text-sm text-gray-500">Faça perguntas com base nos seus dados.</p>
          </a>
        </div>
      </div>
    </main>
  );
}