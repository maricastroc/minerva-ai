import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/axios';
import { MessageProps } from '@/types/message';
import { ChatProps } from '@/types/chat';
import useRequest from '@/hooks/useRequest';
import { ASSISTANT_ROLE, USER_ROLE } from '@/utils/constants';

export interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, mutate } = useRequest<ChatProps[]>({
    url: '/user/chats',
    method: 'GET',
  });

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => scrollToBottom(), [messages]);

  const loadChatMessages = async (chatId: string) => {
    const response = await api.get(`/user/chats/${chatId}/messages`);

    const msgs: Message[] = response.data.data.messages.map(
      (msg: MessageProps) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'USER' | 'ASSISTANT',
        timestamp: new Date(msg.timestamp),
      })
    );

    setMessages(msgs);

    setCurrentChatTitle(response.data.data.title);

    setCurrentChatId(chatId);
  };

  const handleSelectChat = async (chatId: string) => {
    if (chatId === currentChatId) return;

    setMessages([]);

    await loadChatMessages(chatId);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentChatTitle(null);
    setInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: USER_ROLE,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/chatbot', {
        message: userMessage.content,
        chatID: currentChatId,
        conversationHistory: messages.slice(-10).map((msg) => ({
          role: msg.role.toUpperCase(),
          content: msg.content,
        })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        role: ASSISTANT_ROLE,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.isNewConversation) {
        setCurrentChatId(data.chatID);
        const chatResponse = await api.get<ChatProps>(
          `/user/chats/${data.chatID}`
        );
        setCurrentChatTitle(chatResponse.data.title);
        mutate();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: 'Error connecting to the chatbot. Please try again.',
          role: ASSISTANT_ROLE,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    currentChatId,
    currentChatTitle,
    chatHistory,
    handleSelectChat,
    handleNewChat,
    handleSubmit,
    messagesEndRef,
    mutate,
    setCurrentChatTitle,
  };
}
