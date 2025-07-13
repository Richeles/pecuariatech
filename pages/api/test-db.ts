import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await prisma.financeiro.findMany({ take: 1 });
    res.status(200).json({ ok: true, message: 'Conexão com o banco funcionando!', result });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Erro ao conectar com o banco', error });
  }
}
