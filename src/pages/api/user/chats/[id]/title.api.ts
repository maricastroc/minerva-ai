import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { buildNextAuthOptions } from '../../../auth/[...nextauth].api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateTitleSchema = z.object({
  title: z.string().min(1).max(100).trim(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
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

    const validationResult = updateTitleSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.format(),
      });
    }

    const { title } = validationResult.data;

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: String(session.user.id),
      },
    });

    if (!existingConversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: id,
      },
      data: {
        title: title,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        id: updatedConversation.id,
        title: updatedConversation.title,
        createdAt: updatedConversation.createdAt,
        updatedAt: updatedConversation.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating conversation title:', error);

    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
