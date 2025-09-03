/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { buildNextAuthOptions } from '../auth/[...nextauth].api';
import { ChatService } from '@/services/chatService';

const requestSchema = z.object({
  message: z.string().min(1).max(2000),
  chatID: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['USER', 'ASSISTANT']),
        content: z.string(),
      })
    )
    .optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(
      req,
      res,
      buildNextAuthOptions(req, res)
    );

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validationResult = requestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.format(),
      });
    }

    const { message, chatID, conversationHistory = [] } = validationResult.data;

    const result = await ChatService.processMessage({
      userId: String(session.user.id),
      message,
      chatID,
      conversationHistory,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.code === 'RATE_LIMITED') {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const fallbackResponse =
      "I'm experiencing some technical difficulties. Please try again shortly.";

    return res.status(200).json({
      reply: fallbackResponse,
      chatID: req.body.chatID || null,
      isNewConversation: false,
    });
  }
}
