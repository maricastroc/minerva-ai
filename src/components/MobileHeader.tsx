// MobileHeader.tsx
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useState } from 'react';
import { MobileSidebar } from './MobileSidebar';
import { ChatProps } from '@/types/chat';

interface MobileHeaderProps {
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (value: string) => void;
  currentChatId: string | null;
  handleNewChat: () => void;
}

export const MobileHeader = ({
  chatHistory,
  handleNewChat,
  handleSelectChat,
  currentChatId,
}: MobileHeaderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-primary-gray900 p-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 cursor-pointer rounded-md hover:bg-primary-gray700 transition-colors"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        <div className="flex-1 mx-4 flex justify-center">
          <Image width={150} height={150} alt="Logo" src="/logo-full.svg" />
        </div>
        <div className="w-10"></div>
      </div>

      <MobileSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        handleNewChat={handleNewChat}
        handleSelectChat={handleSelectChat}
      />
    </div>
  );
};
