/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { buildNextAuthOptions } from '../auth/[...nextauth].api';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are an AI assistant named "Simple Chat AI". Follow these guidelines:

1. Always be respectful, empathetic, and professional
2. Provide clear, concise, and helpful responses
3. Maintain a friendly and approachable tone
4. If you don't know something, admit it honestly
5. Avoid unnecessary technical jargon
6. Respond in the same language as the user's query
7. Be proactive in offering additional help when appropriate
8. Never provide harmful, unethical, or dangerous information
9. Respect user privacy and confidentiality
10. Adapt your response style to match the user's tone and needs

Focus on being genuinely helpful while maintaining appropriate boundaries.
`;

const PRIORITY_MODELS = [
  'models/gemini-1.5-flash-002',
  'models/gemini-1.5-flash',
  'models/gemini-1.5-flash-8b',
  'models/gemini-1.5-pro-002',
  'models/gemini-1.5-pro',
];

const responseCache = new Map<
  string,
  { response: string; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
}, 60 * 1000);

function getCacheKey(messages: any[], userMessage: string): string {
  const recentHistory = messages.slice(-3); // Últimas 3 mensagens
  return `${userMessage}-${recentHistory.map((msg) => `${msg.role}:${msg.content}`).join('|')}`;
}

function getLocalFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  const responses = [
    {
      keywords: ['hello', 'hi', 'hey', 'hola', 'oi', 'olá'],
      response: 'Hello! How can I help you today?',
    },
    {
      keywords: ['thank', 'thanks', 'obrigado', 'obrigada', 'appreciate'],
      response: "You're welcome! Is there anything else I can help with?",
    },
    {
      keywords: ['how are you', 'how do you do', 'tudo bem', 'como vai'],
      response:
        "I'm functioning well, thank you for asking! How can I assist you?",
    },
    {
      keywords: ['bye', 'goodbye', 'tchau', 'see you', 'até logo'],
      response: 'Goodbye! Feel free to return if you have more questions.',
    },
    {
      keywords: ['help', 'ajuda', 'support', 'suporte'],
      response:
        "I'm here to help! Please tell me what you need assistance with.",
    },
    {
      keywords: ['name', 'who are you', 'quem é você'],
      response: "I'm Simple Chat AI, your friendly AI assistant!",
    },
  ];

  // Verificar respostas específicas primeiro
  for (const item of responses) {
    if (item.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }

  if (lowerMessage.includes('?')) {
    if (lowerMessage.includes('how to') || lowerMessage.includes('como')) {
      return "I'd be happy to help you with that. Could you provide more details about what you're trying to accomplish?";
    }
    if (lowerMessage.includes('what is') || lowerMessage.includes('o que é')) {
      return "That's an interesting question. Let me think about the best way to explain this...";
    }
    if (lowerMessage.includes('why') || lowerMessage.includes('porque')) {
      return 'There are several reasons for that. The main factors usually include...';
    }
  }

  const fallbacks = [
    "I understand. Could you tell me more about what you're looking for?",
    "That's interesting! How can I assist you with this?",
    "I'd be happy to help with that. What specific information do you need?",
    'Thank you for sharing. How can I support you with this matter?',
    'I see. Let me know how I can best assist you with this.',
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

async function generateTitle(firstMessage: string): Promise<string> {
  const modelsToTry = [
    'models/gemini-1.5-flash-002',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-8b',
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      });

      const prompt = `Generate a very short title (max 5 words) for this message: "${firstMessage}". Reply with title only, no quotes or explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let title = response.text().trim();

      title = title.replace(/["'.]/g, '');
      return (
        title.split(' ').slice(0, 5).join(' ') ||
        firstMessage.substring(0, 25) + '...'
      );
    } catch (error) {
      console.log(
        `${error} - Model ${modelName} failed for title generation, trying next...`
      );
      continue;
    }
  }

  console.error('All models failed for title generation:', firstMessage);

  const meaningfulWords = firstMessage
    .split(' ')
    .filter(
      (word) =>
        word.length > 3 &&
        !['how', 'which', 'when', 'where', 'why', 'about'].includes(
          word.toLowerCase()
        )
    )
    .slice(0, 4)
    .join(' ');
  return meaningfulWords || firstMessage.substring(0, 25) + '...';
}

async function tryMultipleModels(prompt: string): Promise<string> {
  const errors: any[] = [];

  for (const modelName of PRIORITY_MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith('Assistant:')) {
        text = text.replace(/^Assistant:\s*/i, '').trim();
      }
      if (text.startsWith('Assistant :')) {
        text = text.replace(/^Assistant\s*:\s*/i, '').trim();
      }

      console.log(`Success with model: ${modelName}`);
      return text;
    } catch (error: any) {
      console.log(`Model ${modelName} failed:`, error.message);
      errors.push({ model: modelName, error: error.message });

      if (
        error.status === 429 ||
        error.message.includes('quota') ||
        error.message.includes('rate limit')
      ) {
        console.log(`Quota exceeded for ${modelName}, trying next model...`);
        continue;
      }

      continue;
    }
  }

  throw new Error(`All models failed: ${JSON.stringify(errors)}`);
}

function buildPrompt(conversationHistory: any[], message: string): string {
  let prompt = SYSTEM_PROMPT;

  if (conversationHistory.length > 0) {
    prompt += '\n\nPrevious conversation:\n';
    prompt += conversationHistory
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  prompt += `\n\nUser: ${message}`;
  prompt += `\n\nPlease provide a helpful response:`;

  return prompt;
}

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

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message, chatID, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const cacheKey = getCacheKey(conversationHistory, message);
    const cachedResponse = responseCache.get(cacheKey);

    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      console.log('Serving response from cache');

      let conversationId = chatID;
      let isNewConversation = false;

      if (!conversationId) {
        const title = await generateTitle(message);
        const newConversation = await prisma.conversation.create({
          data: {
            title: title,
            userId: String(session.user.id),
          },
        });
        conversationId = newConversation.id;
        isNewConversation = true;
      }

      const userMessage = await prisma.message.create({
        data: {
          content: message,
          role: 'USER',
          conversationId: conversationId,
        },
      });

      const assistantMessage = await prisma.message.create({
        data: {
          content: cachedResponse.response,
          role: 'ASSISTANT',
          conversationId: conversationId,
        },
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return res.status(200).json({
        reply: cachedResponse.response,
        chatID: conversationId,
        isNewConversation: isNewConversation,
        messageIds: {
          userMessageId: userMessage.id,
          assistantMessageId: assistantMessage.id,
        },
      });
    }

    let conversationId = chatID;
    let isNewConversation = false;

    if (!conversationId) {
      const title = await generateTitle(message);
      const newConversation = await prisma.conversation.create({
        data: {
          title: title,
          userId: String(session.user.id),
        },
      });
      conversationId = newConversation.id;
      isNewConversation = true;
    }

    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'USER',
        conversationId: conversationId,
      },
    });

    const fullPrompt = buildPrompt(conversationHistory, message);

    let text: string;

    try {
      text = await tryMultipleModels(fullPrompt);

      responseCache.set(cacheKey, {
        response: text,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('All AI models failed, using local fallback:', error);
      text = getLocalFallbackResponse(message);
    }

    const assistantMessage = await prisma.message.create({
      data: {
        content: text,
        role: 'ASSISTANT',
        conversationId: conversationId,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(200).json({
      reply: text,
      chatID: conversationId,
      isNewConversation: isNewConversation,
      messageIds: {
        userMessageId: userMessage.id,
        assistantMessageId: assistantMessage.id,
      },
    });
  } catch (error: any) {
    console.error('Chatbot API error:', error);

    const fallbackResponse = getLocalFallbackResponse(req.body.message || '');

    if (req.body.chatID) {
      try {
        await prisma.message.create({
          data: {
            content: fallbackResponse,
            role: 'ASSISTANT',
            conversationId: req.body.chatID,
          },
        });
      } catch (dbError) {
        console.error('Error saving error message to database:', dbError);
      }
    }

    res.status(200).json({
      reply: fallbackResponse,
      chatID: req.body.chatID || null,
      isNewConversation: false,
    });
  }
}
