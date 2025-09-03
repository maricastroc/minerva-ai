import { prisma } from '@/lib/prisma';

export class DatabaseService {
  async createConversation(userId: string, title: string): Promise<string> {
    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId,
      },
    });
    return conversation.id;
  }

  async createMessage(data: {
    content: string;
    role: 'USER' | 'ASSISTANT';
    conversationId: string;
  }): Promise<string> {
    const message = await prisma.message.create({
      data,
    });
    return message.id;
  }

  async updateConversationTimestamp(conversationId: string): Promise<void> {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }
}
