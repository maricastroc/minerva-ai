import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type DropdownType = 'user' | 'chat' | null;

interface DropdownContextType {
  openDropdownType: DropdownType;
  openChatId: string | null;
  toggleUserDropdown: () => void;
  toggleChatDropdown: (chatId: string) => void;
  closeAllDropdowns: () => void;
  isUserDropdownOpen: boolean;
  isChatDropdownOpen: (chatId: string) => boolean;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [openDropdownType, setOpenDropdownType] = useState<DropdownType>(null);
  
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdownType(null);
    setOpenChatId(null);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setOpenDropdownType(current => {
      if (current === 'user') {
        setOpenChatId(null);
        return null;
      } else {
        setOpenChatId(null);
        return 'user';
      }
    });
  }, []);

  const toggleChatDropdown = useCallback((chatId: string) => {
    setOpenDropdownType(current => {
      if (current === 'chat' && openChatId === chatId) {
        setOpenChatId(null);
        return null;
      } else {
        setOpenChatId(chatId);
        return 'chat';
      }
    });
  }, [openChatId]);

  const isChatDropdownOpen = useCallback((chatId: string) => {
    return openDropdownType === 'chat' && openChatId === chatId;
  }, [openDropdownType, openChatId]);

  const value: DropdownContextType = {
    openDropdownType,
    openChatId,
    closeAllDropdowns,
    toggleUserDropdown,
    toggleChatDropdown,
    isUserDropdownOpen: openDropdownType === 'user',
    isChatDropdownOpen,
  };

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdownManager = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdownManager must be used within DropdownProvider');
  }
  return context;
};