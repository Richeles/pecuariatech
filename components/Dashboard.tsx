'use client'

import { useEffect, useState } from 'react'

import supabase from '@/app/lib/supabase-browser'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

export default function Dashboard() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {

    async function loadData() {

      const client = supabase()

      const { data, error } = await client
        .from('financeiro')
        .select('*')

      if (!error && data) {
        setData(data)
      }
    }

    loadData()

  }, [])

  return (

    <div
      className="min-h-screen flex flex-col p-6"
      style={{ minHeight: '300px' }}
    >

      <h2 className="text-2xl font-bold mb-6">
        💹 Dashboard Financeiro
      </h2>

      <LineChart
        width={600}
        height={300}
        data={data}
      >

        <CartesianGrid stroke="#ccc" />

        <XAxis dataKey="data" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="valor"
          stroke="#16a34a"
          strokeWidth={2}
        />

      </LineChart>

    </div>
  )
}