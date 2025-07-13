import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Buscar todas as pastagens
      const pastagens = await prisma.pastagem.findMany();
      return res.status(200).json(pastagens);
    } else if (req.method === 'POST') {
      // Criar nova pastagem
      const data = req.body;
      const novaPastagem = await prisma.pastagem.create({
        data,
      });
      return res.status(201).json(novaPastagem);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API Pastagem:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
