import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { buildNextAuthOptions } from '../auth/[...nextauth].api';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res)
  );

  if (!session) {
    return res.status(403).json({ message: 'You must be logged in' });
  }

  const { title } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId: String(session.user.id),
      },
    });

    return res.status(201).json(conversation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
