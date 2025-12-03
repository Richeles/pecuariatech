<meta charSet='UTF-8' />
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function FinanceiroPage() {
  const [tipo, setTipo] = useState('entrada')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [registros, setRegistros] = useState([])

  const fetchRegistros = async () => {
    try {
      const res = await axios.get('/api/financeiro')
      setRegistros(res.data.data)
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
    }
  }

  useEffect(() => {
    fetchRegistros()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      await axios.post('/api/financeiro', { tipo, descricao, valor: parseFloat(valor), data })
      setDescricao('')
      setValor('')
      setData('')
      fetchRegistros()
    } catch (error) {
      console.error('Erro ao salvar registro:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold text-center mb-6">GestÃ£o Financeira</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Tipo:</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">SaÃ­da</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">DescriÃ§Ã£o:</label>
          <input
            type="text"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Valor:</label>
          <input
            type="number"
            value={valor}
            onChange={e => setValor(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Data:</label>
          <input
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
        >
          Salvar
        </button>
      </form>

      <h2 className="mt-8 text-xl font-semibold text-center">Registros</h2>
      <ul className="mt-4 space-y-3">
        {registros.map((r: any) => (
          <li
            key={r.id}
            className="border border-gray-300 rounded p-3 flex justify-between items-center"
          >
            <span className="font-bold">{r.tipo.toUpperCase()}</span>
            <span>{r.descricao}</span>
            <span>R${r.valor}</span>
            <span>{r.data}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}









