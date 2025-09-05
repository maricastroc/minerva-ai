import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/axios';
import { ChatProps } from '@/types/chat';
import useRequest from '@/hooks/useRequest';
import { ASSISTANT_ROLE, USER_ROLE } from '@/utils/constants';
import { useAppContext } from '@/contexts/AppContext';

export interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  timestamp: Date;
}

export function useChat() {
  const {
    messages,
    currentChatId,
    handleCurrentChatId,
    loadChatMessages,
    handleMessages,
    handleCurrentChatTitle,
  } = useAppContext();

  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, mutate } = useRequest<ChatProps[]>({
    url: '/user/chats',
    method: 'GET',
  });

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => scrollToBottom(), [messages]);

  const handleSelectChat = async (chatId: string) => {
    if (chatId === currentChatId) return;

    handleMessages([]);

    await loadChatMessages(chatId);
  };

  const handleNewChat = () => {
    handleMessages([]);
    handleCurrentChatId(null);
    handleCurrentChatTitle(null);
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

    handleMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/chatbot', {
        message: userMessage.content,
        chatID: currentChatId || undefined,
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

      handleMessages((prev) => [...prev, assistantMessage]);

      if (data.isNewConversation) {
        handleCurrentChatId(data.chatID);

        const chatResponse = await api.get<ChatProps>(
          `/user/chats/${data.chatID}`
        );

        handleCurrentChatTitle(chatResponse.data.title);
        mutate();
      }
    } catch (err) {
      console.error(err);

      handleMessages((prev) => [
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
    chatHistory,
    handleSelectChat,
    handleNewChat,
    handleSubmit,
    messagesEndRef,
    mutate,
  };
}
