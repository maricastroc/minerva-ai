/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const responseCache = new Map<
  string,
  { response: string; timestamp: number }
>();

const CACHE_TTL = 5 * 60 * 1000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const PRIORITY_MODELS = [
  'models/gemini-1.5-flash-002',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-flash-8b',
  'models/gemini-1.5-pro-002',
  'models/gemini-1.5-pro',
];

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
        .catch((error) => {
          console.error('AI response error:', error);
          return this.getFallbackResponse(message);
        }),
    ]);

    const [assistantMessageId] = await Promise.all([
      prisma.message
        .create({
          data: {
            content: reply,
            role: 'ASSISTANT',
            conversationId: conversationId,
          },
        })
        .then((msg) => msg.id),

      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return {
      reply,
      chatID: conversationId,
      isNewConversation,
      messageIds: {
        userMessageId,
        assistantMessageId,
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
      model: 'models/gemini-1.5-flash-8b',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 25,
      },
    });

    const prompt = `Título muito curto (2-3 palavras) para: "${message}"`;
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
        console.log(`Model ${modelName} failed:`, error.message);
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

    const [userMessageId, assistantMessageId] = await Promise.all([
      prisma.message
        .create({
          data: {
            content: message,
            role: 'USER',
            conversationId: conversationId,
          },
        })
        .then((msg) => msg.id),

      prisma.message
        .create({
          data: {
            content: cachedResponse,
            role: 'ASSISTANT',
            conversationId: conversationId,
          },
        })
        .then((msg) => msg.id),

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
        assistantMessageId,
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
      You are a friendly, empathetic and helpful AI assistant. 
      Respond in a warm, conversational tone, adding encouragement and understanding when appropriate. 
      Keep answers clear, but not too short.
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

  private static getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! How can I help you today?';
    }
    if (lowerMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help with?";
    }
    if (lowerMessage.includes('how are you')) {
      return "I'm doing well, thank you! How can I assist you?";
    }
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return 'Goodbye! Feel free to return if you have more questions.';
    }

    const fallbacks = [
      'I understand. Could you tell me more about that?',
      "That's interesting! How can I help with this?",
      "I'd be happy to assist. What specifically do you need?",
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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

export interface ProcessMessageRequest {
  userId: string;
  message: string;
  chatID?: string;
  conversationHistory?: Array<{
    role: 'USER' | 'ASSISTANT';
    content: string;
  }>;
}

export interface ProcessMessageResponse {
  reply: string;
  chatID: string;
  isNewConversation: boolean;
  messageIds: {
    userMessageId: string;
    assistantMessageId: string;
  };
}
