return (
  <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/30">

    <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
      Cadastro PecuariaTech
    </h1>

    <form onSubmit={handleRegister} className="space-y-5">

      <input
        name="nome"
        required
        placeholder="Nome completo"
        className="w-full bg-white/80 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 p-3 rounded-xl transition"
      />

      <input
        name="email"
        required
        type="email"
        placeholder="Email"
        className="w-full bg-white/80 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 p-3 rounded-xl transition"
      />

      <input
        name="senha"
        required
        type="password"
        placeholder="Senha"
        className="w-full bg-white/80 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 p-3 rounded-xl transition"
      />

      <select
        required
        value={pais}
        onChange={(e) => setPais(e.target.value)}
        className="w-full bg-white/80 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 p-3 rounded-xl transition"
      >
        <option value="">Selecione o País</option>
        <option value="BR">Brasil</option>
        <option value="US">Estados Unidos</option>
        <option value="AR">Argentina</option>
        <option value="MX">México</option>
        <option value="CO">Colômbia</option>
        <option value="UY">Uruguai</option>
        <option value="CL">Chile</option>
        <option value="PY">Paraguai</option>
      </select>

      <select
        name="segmento"
        required
        className="w-full bg-white/80 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 p-3 rounded-xl transition"
      >
        <option value="">Segmento Pecuário</option>
        <option value="corte">Corte</option>
        <option value="leite">Leite</option>
        <option value="misto">Misto</option>
        <option value="consultor">Consultor</option>
        <option value="veterinario">Veterinário</option>
      </select>

      <input
        name="telefone"
        placeholder="Telefone (com DDI)"
        className="w-full bg-white/80 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 p-3 rounded-xl transition"
      />

      {pais === "BR" && (
        <input
          name="documento"
          required
          placeholder="CPF ou CNPJ"
          className="w-full bg-white/80 border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-500/40 p-3 rounded-xl transition"
        />
      )}

      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
      >
        {loading ? "Criando conta..." : "Criar Conta"}
      </button>

    </form>
  </div>
);