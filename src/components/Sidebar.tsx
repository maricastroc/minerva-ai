import { ChatProps } from '@/types/chat';
import Image from 'next/image';
import { UserSection } from './UserSection';
import { NewChatButton } from './NewChatButton';

import { useState } from 'react';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';
import { SidebarSimpleIcon } from '@phosphor-icons/react';
import { ChatList } from './ChatList';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (value: string) => void;
  handleNewChat: () => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>;
}

export const Sidebar = ({
  chatHistory,
  isOpen,
  setIsOpen,
  handleSelectChat,
  handleNewChat,
  mutate,
}: Props) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);

  return (
    <div
      className={`
        ${isOpen ? 'w-64' : 'w-16 items-center'} 
        bg-primary-gray800 transition-all duration-300 overflow-hidden flex flex-col relative
      `}
    >
      {isOpen ? (
        <>
          <div className="p-6 pt-3 flex items-center justify-between w-full pb-2">
            <Image width={140} height={140} alt="Logo" src="/logo-full.svg" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer mt-[0.2rem] bg-transparent p-2 mr-[-0.7rem] hover:bg-primary-gray600 rounded-md transition-colors"
            >
              <SidebarSimpleIcon className="text-primary-gray100" size={22} />
            </button>
          </div>

          <NewChatButton handleNewChat={handleNewChat} />

          <ChatList
            chatHistory={chatHistory}
            handleSelectChat={handleSelectChat}
            editingChatId={editingChatId}
            setEditingChatId={setEditingChatId}
            mutate={mutate}
          />
          <UserSection />
        </>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="cursor-pointer p-4 bg-transparent rounded-md hover:bg-primary-gray700 transition-colors"
        >
          <Image width={26} height={26} alt="Logo" src="/logo.svg" />
        </button>
      )}
    </div>
  );
};
