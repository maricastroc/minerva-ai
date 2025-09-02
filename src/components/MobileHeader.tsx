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
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#181818] p-4 border-b border-[#303133]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
        </button>
        <div className="flex-1 mx-4 flex justify-center">
          <Image width={140} height={140} alt="Logo" src="/logo-full.svg" />
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
