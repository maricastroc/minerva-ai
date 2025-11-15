import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

import { buildNextAuthOptions } from '../../auth/[...nextauth].api';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(
      req,
      res,
      buildNextAuthOptions(req, res)
    );

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chats = await prisma.conversation.findMany({
      where: {
        userId: String(session.user.id),
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
          select: {
            content: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedchats = chats.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.messages[0]?.content || 'No messages yet',
    }));

    return res.status(200).json({ data: formattedchats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
