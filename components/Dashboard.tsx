'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-browser'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
    <div className=" min-h-[100vh] flex flex-col" style={{ minHeight: "300px" }}>
      <h2 className=" min-h-[100vh] flex flex-col">💹 Dashboard Financeiro</h2>
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







