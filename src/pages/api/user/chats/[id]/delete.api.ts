import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { buildNextAuthOptions } from '../../../auth/[...nextauth].api';
import { prisma } from '@/lib/prisma';

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

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: String(session.user.id),
      },
    });

    if (!existingConversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({
        where: {
          conversationId: id,
        },
      });

      await tx.conversation.delete({
        where: {
          id: id,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully!',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ error: 'Chat not found' });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
