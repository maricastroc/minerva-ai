import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { buildNextAuthOptions } from '../../../auth/[...nextauth].api';
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

    const { id } = req.query;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id as string,
        userId: String(session.user.id),
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id as string,
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        id: true,
        content: true,
        role: true,
        timestamp: true,
      },
    });

    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      role: message.role.toLowerCase() as 'USER' | 'ASSISTANT',
      timestamp: message.timestamp,
    }));

    res.status(200).json({
      data: {
        id,
        messages: formattedMessages,
        title: conversation.title,
      },
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
