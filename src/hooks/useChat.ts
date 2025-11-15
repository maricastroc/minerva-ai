import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/axios';
import { ChatProps } from '@/types/chat';
import useRequest from '@/hooks/useRequest';
import { ASSISTANT_ROLE, USER_ROLE } from '@/utils/constants';
import { useAppContext } from '@/contexts/AppContext';
import { RegenerateMessageResponse } from '@/types/regenerate-message-response';
import { handleApiError } from '@/utils/handleApiError';

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
    isMessageLoading,
    handleIsMessageLoading,
  } = useAppContext();

  const [input, setInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatHistory, isValidating,  mutate } = useRequest<ChatProps[]>({
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

    if (!input.trim() || isMessageLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: USER_ROLE,
      timestamp: new Date(),
    };

    handleMessages((prev) => [...prev, userMessage]);
    setInput('');
    handleIsMessageLoading(true);

    try {
      const { data } = await api.post('/chatbot', {
        message: userMessage.content,
        chatID: currentChatId || undefined,
        conversationHistory: messages.slice(-10).map((msg) => ({
          role: msg.role.toUpperCase(),
          content: msg.content,
        })),
      });

      console.log('Response data:', data);

      handleMessages((prev) => {
        const lastUserMessageIndex = prev.findIndex(
          (msg) => msg.id === userMessage.id && msg.role === USER_ROLE
        );

        if (lastUserMessageIndex === -1) {
          return [
            ...prev,
            {
              id: data.messageIds.userMessageId,
              content: userMessage.content,
              role: USER_ROLE,
              timestamp: new Date(),
            },
            {
              id: data.messageIds.assistantMessageId,
              content: data.reply,
              role: ASSISTANT_ROLE,
              timestamp: new Date(),
            },
          ];
        }

        const updatedMessages = [...prev];
        updatedMessages[lastUserMessageIndex] = {
          ...updatedMessages[lastUserMessageIndex],
          id: data.messageIds.userMessageId,
        };

        updatedMessages.push({
          id: data.messageIds.assistantMessageId,
          content: data.reply,
          role: ASSISTANT_ROLE,
          timestamp: new Date(),
        });

        return updatedMessages;
      });

      if (data.isNewConversation) {
        handleCurrentChatId(data.chatID);

        const chatResponse = await api.get<ChatProps>(
          `/user/chats/${data.chatID}`
        );

        console.log('Chat response:', chatResponse);

        handleCurrentChatTitle(chatResponse.data.title);
        handleCurrentChatId(String(chatResponse?.data.id));
        mutate();
      }
    } catch (err) {
      console.error(err);

      handleMessages((prev) =>
        prev
          .map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, id: 'temp-' + msg.id }
              : msg
          )
          .concat({
            id: Date.now().toString(),
            content: 'Error connecting to the chatbot. Please try again.',
            role: ASSISTANT_ROLE,
            timestamp: new Date(),
          })
      );
    } finally {
      handleIsMessageLoading(false);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    if (!currentChatId || isMessageLoading) return;

    handleIsMessageLoading(true);

    try {
      const { data } = await api.post<RegenerateMessageResponse>(
        '/chatbot/regenerate',
        {
          conversationId: currentChatId,
          messageId: messageId,
        }
      );

      handleMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content: data.regeneratedReply,
                regenerated: true,
              }
            : msg
        )
      );
    } catch (err) {
      handleApiError(err);
    } finally {
      handleIsMessageLoading(false);
    }
  };

  return {
    input,
    setInput,
    currentChatId,
    chatHistory,
    handleSelectChat,
    handleNewChat,
    handleSubmit,
    handleRegenerate,
    messagesEndRef,
    mutate,
    isValidating,
  };
}
