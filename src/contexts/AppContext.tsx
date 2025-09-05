import { api } from '@/lib/axios';
import { MessageProps } from '@/types/message';
import React, { createContext, useContext, useState, useMemo } from 'react';

interface AppContextType {
  isMessageLoading: boolean;
  handleIsMessageLoading: (value: boolean) => void;
  currentChatId: string | null;
  handleCurrentChatId: (value: string | null) => void;
  currentChatTitle: string | null;
  handleCurrentChatTitle: (value: string | null) => void;
  messages: MessageProps[] | [];
  handleMessages: (
    value: MessageProps[] | ((prev: MessageProps[]) => MessageProps[])
  ) => void;
  loadChatMessages: (chatId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const [messages, setMessages] = useState<MessageProps[]>([]);

  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);

  const loadChatMessages = async (chatId: string) => {
    const response = await api.get(`/user/chats/${chatId}/messages`);

    const msgs: MessageProps[] = response.data.data.messages.map(
      (msg: MessageProps) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as 'USER' | 'ASSISTANT',
        timestamp: new Date(msg.timestamp),
      })
    );

    setMessages(msgs);

    setCurrentChatTitle(response.data.data.title);

    handleCurrentChatId(chatId);
  };

  const handleCurrentChatId = (value: string | null) => {
    setCurrentChatId(value);
  };

  const handleCurrentChatTitle = (value: string | null) => {
    setCurrentChatTitle(value);
  };

  const handleMessages = (
    value: MessageProps[] | [] | ((prev: MessageProps[]) => MessageProps[])
  ) => {
    if (typeof value === 'function') {
      setMessages((prev) => value(prev));
    } else {
      setMessages(value);
    }
  };

  const handleIsMessageLoading = (value: boolean) => {
    setIsMessageLoading(value);
  };

  const contextValue = useMemo(
    () => ({
      currentChatId,
      handleCurrentChatId,
      currentChatTitle,
      handleCurrentChatTitle,
      loadChatMessages,
      handleMessages,
      messages,
      isMessageLoading,
      handleIsMessageLoading,
    }),
    [currentChatId, currentChatTitle, messages, isMessageLoading]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
};
