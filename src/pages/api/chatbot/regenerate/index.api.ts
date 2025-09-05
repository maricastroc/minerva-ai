/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { buildNextAuthOptions } from '../../auth/[...nextauth].api';
import { RegenerateService } from '@/services/regenerateService';

const regenerateRequestSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  messageId: z.string().min(1, 'Message ID is required'),
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

    const validationResult = regenerateRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.format(),
      });
    }

    const { conversationId, messageId } = validationResult.data;

    const result = await RegenerateService.regenerateMessage({
      userId: String(session.user.id),
      conversationId,
      messageId,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Regenerate error:', error);

    if (error.message?.includes('already been regenerated')) {
      return res.status(400).json({
        error: error.message || 'This message has already been regenerated',
      });
    }

    if (
      error.message?.includes('not found') ||
      error.message?.includes('access denied')
    ) {
      return res.status(404).json({
        error: error.message || 'Conversation or message not found',
      });
    }

    return res.status(500).json({
      error: error.message || 'Internal server error during regeneration',
    });
  }
}
