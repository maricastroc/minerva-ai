export interface RegenerateMessageResponse {
  regeneratedReply: string;
  newMessageId: string;
  originalMessageId?: string;
}
