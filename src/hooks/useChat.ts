import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/axios';
import { ChatProps } from '@/types/chat';
import useRequest from '@/hooks/useRequest';
import { ASSISTANT_ROLE, USER_ROLE } from '@/utils/constants';
import { useAppContext } from '@/contexts/AppContext';
import { RegenerateMessageResponse } from '@/types/regenerate-message-response';

export interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT';
  timestamp: Date;
  regenerated?: boolean;
  originalMessageId?: string;
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

  const handleRegenerate = async (messageId: string) => {
    if (!currentChatId || isLoading) return;

    setIsLoading(true);

    try {
      const { data } = await api.post<RegenerateMessageResponse>(
        '/chatbot/regenerate',
        {
          conversationId: currentChatId,
          messageId: messageId,
        }
      );

      // Encontra a mensagem original
      const originalMessage = messages.find((msg) => msg.id === messageId);

      if (originalMessage) {
        // Cria a nova mensagem regenerada
        const regeneratedMessage: Message = {
          id: data.newMessageId,
          content: data.regeneratedReply,
          role: ASSISTANT_ROLE,
          timestamp: new Date(),
          regenerated: true,
          originalMessageId: messageId,
        };

        // Marca a mensagem original como regenerada
        const updatedOriginalMessage = {
          ...originalMessage,
          regenerated: true,
        };

        // Substitui a mensagem original pela versão atualizada
        // e adiciona a nova mensagem regenerada no FINAL
        handleMessages((prev) => {
          const newMessages = prev.map((msg) =>
            msg.id === messageId ? updatedOriginalMessage : msg
          );

          // Adiciona a mensagem regenerada no final
          return [...newMessages, regeneratedMessage];
        });
      }
    } catch (err) {
      console.error('Regenerate error:', err);

      const errorMessage = 'Error regenerating response. Please try again.';

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    input,
    setInput,
    isLoading,
    currentChatId,
    chatHistory,
    handleSelectChat,
    handleNewChat,
    handleSubmit,
    handleRegenerate,
    messagesEndRef,
    mutate,
  };
}
