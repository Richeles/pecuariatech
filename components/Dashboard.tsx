'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-browser'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState([])

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.from('financeiro').select('*')
      if (!error && data) setData(data)
    }
    loadData()
  }, [])

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-green-700">💹 Dashboard Financeiro</h2>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="data" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="valor" stroke="#16a34a" strokeWidth={2} />
      </LineChart>
    </div>
  )
}



