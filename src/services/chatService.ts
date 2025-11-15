/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { ProcessMessageResponse } from '@/types/process-message-response';
import { ProcessMessageRequest } from '@/types/process-message-request';
import { PRIORITY_MODELS } from '@/utils/constants';

const responseCache = new Map<
  string,
  { response: string; timestamp: number }
>();

const CACHE_TTL = 5 * 60 * 1000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class ChatService {
  static async processMessage(
    request: ProcessMessageRequest
  ): Promise<ProcessMessageResponse> {
    const { userId, message, chatID, conversationHistory = [] } = request;

    const cacheKey = this.generateCacheKey(conversationHistory, message);
    const cached = responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return this.handleCachedResponse(
        userId,
        message,
        cached.response,
        chatID
      );
    }

    const [conversationId, isNewConversation] =
      await this.getOrCreateConversation(userId, message, chatID);

    const [userMessageId, reply] = await Promise.all([
      prisma.message
        .create({
          data: {
            content: message,
            role: 'USER',
            conversationId: conversationId,
          },
        })
        .then((msg) => msg.id),

      this.generateAIResponse(conversationHistory, message)
        .then(async (response) => {
          responseCache.set(cacheKey, {
            response,
            timestamp: Date.now(),
          });
          return response;
        })
        .catch(() => {
          return 'An unexpected error ocurred.';
        }),
    ]);

    const assistantMessage = await prisma.message.create({
      data: {
        content: reply,
        role: 'ASSISTANT',
        conversationId: conversationId,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      reply,
      chatID: conversationId,
      isNewConversation,
      messageIds: {
        userMessageId,
        assistantMessageId: assistantMessage.id,
      },
    };
  }

  private static async getOrCreateConversation(
    userId: string,
    message: string,
    chatID?: string
  ): Promise<[string, boolean]> {
    if (chatID) {
      return [chatID, false];
    }

    const title = await this.generateTitleQuick(message).catch(
      () => message.substring(0, 30) + (message.length > 30 ? '...' : '')
    );

    const conversation = await prisma.conversation.create({
      data: {
        title: title,
        userId: userId,
      },
    });

    return [conversation.id, true];
  }

  private static async generateTitleQuick(message: string): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: 'models/gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 25,
      },
    });

    const prompt = `Generate a short title for this message: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return (
      response
        .text()
        .trim()
        .replace(/["'.]/g, '')
        .split(' ')
        .slice(0, 3)
        .join(' ') || message.substring(0, 20) + '...'
    );
  }

  private static async generateAIResponse(
    conversationHistory: any[],
    message: string
  ): Promise<string> {
    const prompt = this.buildPrompt(conversationHistory, message);

    for (const modelName of PRIORITY_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 20,
            maxOutputTokens: 1024,
          },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        text = text.replace(/^Assistant:?\s*/i, '').trim();
        return text;
      } catch (error: any) {
        if (error.status === 429) continue;
        throw error;
      }
    }

    throw new Error('All models failed');
  }

  private static async handleCachedResponse(
    userId: string,
    message: string,
    cachedResponse: string,
    chatID?: string
  ): Promise<ProcessMessageResponse> {
    const [conversationId, isNewConversation] =
      await this.getOrCreateConversation(userId, message, chatID);

    const [userMessageId, assistantMessage] = await Promise.all([
      prisma.message
        .create({
          data: {
            content: message,
            role: 'USER',
            conversationId: conversationId,
          },
        })
        .then((msg) => msg.id),

      prisma.message.create({
        data: {
          content: cachedResponse,
          role: 'ASSISTANT',
          conversationId: conversationId,
        },
      }),

      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return {
      reply: cachedResponse,
      chatID: conversationId,
      isNewConversation,
      messageIds: {
        userMessageId,
        assistantMessageId: assistantMessage.id, // ← RETORNE O ID CORRETO
      },
    };
  }

  private static generateCacheKey(
    conversationHistory: any[],
    message: string
  ): string {
    const recentHistory = conversationHistory.slice(-3);
    return `${message}-${recentHistory.map((msg) => `${msg.role}:${msg.content}`).join('|')}`;
  }

  private static buildPrompt(
    conversationHistory: any[],
    message: string
  ): string {
    const SYSTEM_PROMPT = `
  You are a helpful assistant who responds in a natural and direct way. 
  When the user asks for book suggestions, offer specific recommendations 
  or ask for more details about their preferences.
  
  IMPORTANT: Do not be overly generic. Respond directly to what was asked.
  If the user requests book suggestions, provide real examples or ask about preferred genres.
  
  Rules:
  - Do not reply with “I'd be happy to assist” without adding useful content
  - Provide real value in every response
  - Be specific whenever possible
`;

    let prompt = SYSTEM_PROMPT;

    if (conversationHistory.length > 0) {
      prompt += '\n\nContext:\n';
      const limitedHistory = conversationHistory.slice(-6);
      prompt += limitedHistory
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n');
    }

    prompt += `\n\nUser: ${message}\nAssistant:`;
    return prompt;
  }
}
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
}, 60 * 1000);
