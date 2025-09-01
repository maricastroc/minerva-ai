import { ChatProps } from '@/types/chat';

export const MOCK_CHAT_HISTORY: ChatProps[] = [
  {
    id: '1',
    title: 'Explanation about artificial intelligence',
    date: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    title: 'How to learn TypeScript?',
    date: new Date(Date.now() - 172800000),
  },
  {
    id: '3',
    title: 'Responsive design tips',
    date: new Date(Date.now() - 259200000),
  },
];
