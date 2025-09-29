import { supabase } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function RebanhoPage() {
    const [data, setData] = useState<any[]>([])
    
    useEffect(() => {
        supabase.from('rebanho').select('*').then(res => setData(res.data || []))
    }, [])

    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-4'>Rebanho</h1>
            <ul>
                {data.map((item) => (
                    <li key={item.id}>{item.nome} - {item.raca}</li>
                ))}
            </ul>
        </div>
    )
}
