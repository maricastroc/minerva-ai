/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/chatbot.ts
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

// Função para gerar título
async function generateTitle(firstMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    });

    const prompt = `Generate a very short title (max 5 words) for this message: "${firstMessage}". Reply with title only, no quotes or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();

    // Limpar o título
    title = title.replace(/["'.]/g, '');
    return (
      title.split(' ').slice(0, 5).join(' ') ||
      firstMessage.substring(0, 25) + '...'
    );
  } catch (error) {
    console.error('Error generating title:', error);
    // Fallback para título simples
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

    let conversationId = chatID;
    let isNewConversation = false;

    // Se não tem chatID, criar nova conversa
    if (!conversationId) {
      // Gerar título baseado na primeira mensagem
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

    // Salvar mensagem do usuário
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'USER',
        conversationId: conversationId,
      },
    });

    // Gerar resposta da IA
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const fullPrompt = `
${SYSTEM_PROMPT}

Conversation history:
${conversationHistory
  .map((msg: any) => `${msg.role}: ${msg.content}`)
  .join('\n')}

User: ${message}

Assistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Salvar resposta do assistente
    const assistantMessage = await prisma.message.create({
      data: {
        content: text,
        role: 'ASSISTANT',
        conversationId: conversationId,
      },
    });

    // Atualizar timestamp da conversa
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

    // Tentar salvar mensagem de erro se tivermos conversationId
    if (req.body.chatID) {
      try {
        await prisma.message.create({
          data: {
            content:
              "I apologize, but I'm experiencing some technical difficulties right now.",
            role: 'ASSISTANT',
            conversationId: req.body.chatID,
          },
        });
      } catch (dbError) {
        console.error('Error saving error message to database:', dbError);
      }
    }

    res.status(200).json({
      reply:
        "I apologize, but I'm experiencing some technical difficulties right now. Could you please try again or rephrase your question?",
      chatID: req.body.chatID || null,
      isNewConversation: false,
    });
  }
}
