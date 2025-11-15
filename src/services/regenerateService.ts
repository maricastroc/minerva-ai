/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { RegenerateMessageRequest } from '@/types/regenerate-message-request';
import { RegenerateMessageResponse } from '@/types/regenerate-message-response';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class RegenerateService {
  static async regenerateMessage(
    request: RegenerateMessageRequest
  ): Promise<RegenerateMessageResponse> {
    const { userId, conversationId, messageId } = request;

    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          select: { userId: true }
        }
      }
    });

    if (!existingMessage) {
      throw new Error('Message not found');
    }

    if (existingMessage.regenerated) {
      throw new Error(
        'This message has already been regenerated once. Cannot regenerate again.'
      );
    }

    if (existingMessage.role?.toUpperCase() !== 'ASSISTANT') {
      throw new Error('Only assistant messages can be regenerated');
    }

    if (existingMessage.conversation.userId !== userId) {
      throw new Error('Access denied');
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const targetMessageIndex = conversation.messages.findIndex(
      (msg) => msg.id === messageId
    );

    if (targetMessageIndex === -1) {
      throw new Error('Message not found in conversation');
    }

    const userMessage = conversation.messages[targetMessageIndex - 1];
    if (!userMessage || userMessage.role !== 'USER') {
      throw new Error('Corresponding user message not found');
    }

    const conversationHistory = conversation.messages
      .slice(0, targetMessageIndex - 1)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    const newResponse = await this.generateRegeneratedResponse(
      conversationHistory,
      userMessage.content,
      existingMessage.content
    );

    if (!newResponse || newResponse.trim() === '') {
      throw new Error('Failed to generate regenerated response');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: newResponse,
        regenerated: true,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      regeneratedReply: newResponse,
      newMessageId: updatedMessage.id,
      originalMessageId: messageId,
    };
  }

  private static async generateRegeneratedResponse(
    conversationHistory: any[],
    userMessage: string,
    originalResponse: string
  ): Promise<string> {
    const prompt = this.buildRegenerationPrompt(
      conversationHistory,
      userMessage,
      originalResponse
    );

    try {
      const model = genAI.getGenerativeModel({
        model: 'models/gemini-2.5-flash',
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      text = text.replace(/^Assistant:?\s*/i, '').trim();

      if (text && text !== originalResponse) {
        return text;
      } else {
        throw new Error('Empty or unchanged response');
      }
    } catch (error: any) {
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  private static buildRegenerationPrompt(
    conversationHistory: any[],
    userMessage: string,
    originalResponse: string
  ): string {
    let prompt = `You are a helpful AI assistant. The user asked you to regenerate your previous response to make it better, more helpful, or more detailed.

CONTEXT:
User's original question: "${userMessage}"
Your previous response: "${originalResponse}"

CONVERSATION HISTORY (for context):
`;

    if (conversationHistory.length > 0) {
      const limitedHistory = conversationHistory.slice(-4);
      prompt += limitedHistory
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n');
    } else {
      prompt += 'No previous conversation history.';
    }

    prompt += `

YOUR TASK:
Generate a NEW improved version of your response. Make it:
- More helpful and detailed than the original
- Better address the user's question or needs
- Maintain a natural, conversational tone
- If the original was too brief, provide more information
- If the original missed the point, correct it
- Do NOT simply rephrase the original response
- Do NOT start with "Sure!" or similar phrases
- Do NOT reference that this is a regeneration

IMPORTANT: Provide a completely new response that improves upon the original.

Your new improved response: `;

    return prompt;
  }

  static async canRegenerateMessage(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            select: { userId: true },
          },
        },
      });

      return (
        !!message &&
        message.role === 'ASSISTANT' &&
        !message.regenerated &&
        message.conversation.userId === userId
      );
    } catch (error) {
      console.error('Error checking regeneration permission:', error);
      return false;
    }
  }
}