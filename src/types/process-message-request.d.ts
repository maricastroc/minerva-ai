export interface ProcessMessageRequest {
  userId: string;
  message: string;
  chatID?: string;
  conversationHistory?: Array<{
    role: 'USER' | 'ASSISTANT';
    content: string;
  }>;
}
