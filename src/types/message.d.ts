export interface MessageProps {
  id: string | number;
  role: string;
  content: string;
  timestamp: Date;
  regenerated?: boolean;
  originalMessageId?: string;
}
