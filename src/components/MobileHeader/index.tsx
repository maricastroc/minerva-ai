/* eslint-disable @typescript-eslint/no-explicit-any */
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useState } from 'react';

import { ChatProps } from '@/types/chat';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';
import { MobileSidebar } from './partials/MobileSidebar';

interface MobileHeaderProps {
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (value: string) => void;
  handleNewChat: () => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[], any>>;
  currentChatTitle: string | null;
  setCurrentChatTitle: (value: string) => void;
}

export const MobileHeader = ({
  chatHistory,
  handleNewChat,
  handleSelectChat,
  mutate,
  currentChatTitle,
  setCurrentChatTitle,
}: MobileHeaderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="w-full sticky top-0 z-50 bg-primary-gray900 p-3">
      <div className="p-2 w-full flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="cursor-pointer rounded-md hover:bg-primary-gray700 transition-colors"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>

        <div className="flex w-full">
          <p className="w-full font-semibold text-base text-gray-200 text-center">
            {currentChatTitle || 'New Chat'}
          </p>
        </div>

        <div className="flex justify-end">
          <Image width={25} height={25} alt="Logo" src="/logo.svg" />
        </div>
      </div>

      <MobileSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        chatHistory={chatHistory}
        handleNewChat={handleNewChat}
        handleSelectChat={handleSelectChat}
        mutate={mutate}
        setCurrentChatTitle={setCurrentChatTitle}
      />
    </div>
  );
};
