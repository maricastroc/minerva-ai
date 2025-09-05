/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { RegenerateMessageRequest } from '@/types/regenerate-message-request';
import { RegenerateMessageResponse } from '@/types/regenerate-message-response';
import { PRIORITY_MODELS } from '@/utils/constants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class RegenerateService {
  static async regenerateMessage(
    request: RegenerateMessageRequest
  ): Promise<RegenerateMessageResponse> {
    const { userId, conversationId, messageId } = request;

    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
      select: { regenerated: true, content: true, role: true },
    });

    if (existingMessage?.regenerated) {
      throw new Error(
        'This message has already been regenerated once. Cannot regenerate again.'
      );
    }

    if (existingMessage?.role !== 'ASSISTANT') {
      throw new Error('Only assistant messages can be regenerated');
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
      throw new Error('Conversation not found or access denied');
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

    // Gera uma nova resposta melhorada
    const newResponse = await this.generateRegeneratedResponse(
      conversationHistory,
      userMessage.content,
      existingMessage.content
    );

    // Cria uma nova mensagem (em vez de atualizar a existente)
    const newMessage = await prisma.message.create({
      data: {
        content: newResponse,
        role: 'ASSISTANT',
        model: 'regenerated',
        regenerated: true,
        conversationId: conversationId,
        tokens: null,
        originalMessageId: messageId, // Relaciona com a mensagem original
      },
    });

    await prisma.message.update({
      where: { id: messageId },
      data: { regenerated: true },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      regeneratedReply: newResponse,
      newMessageId: newMessage.id,
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

    for (const modelName of PRIORITY_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 1.0,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        text = text.replace(/^Assistant:?\s*/i, '').trim();
        return text;
      } catch (error: any) {
        console.log(`Model ${modelName} failed:`, error.message);
        if (error.status === 429) continue;
        throw error;
      }
    }

    throw new Error('All models failed');
  }

  private static buildRegenerationPrompt(
    conversationHistory: any[],
    userMessage: string,
    originalResponse: string
  ): string {
    const SYSTEM_PROMPT = `
You are a helpful AI assistant. The user wants you to regenerate your previous response to make it better.

YOUR TASK:
1. Analyze the user's original message and your previous response
2. Create a NEW improved version that is:
  - More helpful and detailed
  - Better suited to the user's needs
  - Maintains a conversational tone
  - Addresses any shortcomings of the previous response

USER'S ORIGINAL MESSAGE: "${userMessage}"

YOUR PREVIOUS RESPONSE: "${originalResponse}"

IMPORTANT: Do not just rephrase. Provide genuinely better content.
`;

    let prompt = SYSTEM_PROMPT;

    if (conversationHistory.length > 0) {
      prompt += '\n\nCONVERSATION CONTEXT:\n';
      const limitedHistory = conversationHistory.slice(-6);
      prompt += limitedHistory
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n');
    }

    prompt += '\n\nYOUR IMPROVED RESPONSE:\nAssistant:';
    return prompt;
  }

  static async canRegenerateMessage(
    messageId: string,
    userId: string
  ): Promise<boolean> {
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
  }
}
