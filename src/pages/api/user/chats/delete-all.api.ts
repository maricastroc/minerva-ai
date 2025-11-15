import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

import { prisma } from '@/lib/prisma';
import { buildNextAuthOptions } from '../../auth/[...nextauth].api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
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

    const userId = String(session.user.id);

    const userConversations = await prisma.conversation.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    if (userConversations.length === 0) {
      return res.status(200).json({ message: 'No chats found to delete!' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({
        where: {
          conversation: {
            userId: userId,
          },
        },
      });

      await tx.conversation.deleteMany({
        where: {
          userId: userId,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'All chats deleted successfully!',
      deletedCount: userConversations.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ error: 'No chats found to delete' });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}