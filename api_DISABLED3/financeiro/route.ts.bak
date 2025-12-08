import { NextRequest, NextResponse } from 'next/server'

type Registro = {
  id: number
  tipo: string
  descricao: string
  valor: number
  data: string
}

let registros: Registro[] = []
let nextId = 1

export async function GET() {
  return NextResponse.json({ data: registros })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const novoRegistro: Registro = {
    id: nextId++,
    tipo: body.tipo,
    descricao: body.descricao,
    valor: body.valor,
    data: body.data,
  }
  registros.push(novoRegistro)
  return NextResponse.json({ message: 'Registro salvo com sucesso', data: novoRegistro })
}
