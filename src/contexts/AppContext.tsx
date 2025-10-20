import { api } from '@/lib/axios';
import { MessageProps } from '@/types/message';
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';

interface AppContextType {
  isDarkTheme: boolean;
  handleIsDarkTheme: (value: boolean) => void;
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
  handleSetTheme: (value: 'light' | 'dark' | 'system') => void;
  currentTheme: 'light' | 'dark' | 'system';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>(
    'system'
  );

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

  const handleIsDarkTheme = (value: boolean) => {
    setIsDarkTheme(value);
  };

  const handleCurrentChatTitle = (value: string | null) => {
    setCurrentChatTitle(value);
  };

  const handleSetTheme = (theme: 'light' | 'dark' | 'system') => {
    setCurrentTheme(theme);

    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      document.documentElement.setAttribute(
        'data-theme',
        prefersDark ? 'dark' : 'light'
      );
      handleIsDarkTheme(prefersDark);
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      handleIsDarkTheme(theme === 'dark');
      localStorage.setItem('theme', theme);
    }
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

  useEffect(() => {
    const loadTheme = () => {
      const savedTheme = localStorage.getItem('theme') as
        | 'light'
        | 'dark'
        | null;
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      // Determine o tema inicial
      let initialTheme: 'light' | 'dark';

      if (savedTheme) {
        initialTheme = savedTheme;
      } else {
        initialTheme = prefersDark ? 'dark' : 'light';
      }

      document.documentElement.setAttribute('data-theme', initialTheme);
      setCurrentTheme(savedTheme || 'system');
      handleIsDarkTheme(initialTheme === 'dark');
    };

    loadTheme();
  }, []);

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
      isDarkTheme,
      handleIsDarkTheme,
      currentTheme,
      handleSetTheme,
    }),
    [
      currentChatId,
      currentChatTitle,
      messages,
      isMessageLoading,
      isDarkTheme,
      currentTheme,
    ]
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
