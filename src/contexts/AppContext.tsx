import React, { createContext, useContext, useState, useMemo } from 'react';

interface AppContextType {
  currentChatId: string | null;
  handleCurrentChatId: (value: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const handleCurrentChatId = (value: string | null) => {
    setCurrentChatId(value);
  };

  const contextValue = useMemo(
    () => ({
      currentChatId,
      handleCurrentChatId,
    }),
    [currentChatId]
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
