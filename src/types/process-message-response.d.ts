export interface ProcessMessageResponse {
  reply: string;
  chatID: string;
  isNewConversation: boolean;
  messageIds: {
    userMessageId: string;
    assistantMessageId: string;
  };
}
