/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatProps } from '@/types/chat';
import Image from 'next/image';
import { UserSection } from './UserSection';
import { NewChatButton } from './NewChatButton';
import { ChatCard } from './ChatCard';
import { useState } from 'react';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (value: string) => void;
  currentChatId: string | null;
  handleNewChat: () => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[], any>>;
  setCurrentChatTitle: (value: string) => void;
}

export const Sidebar = ({
  chatHistory,
  isOpen,
  currentChatId,
  setIsOpen,
  handleSelectChat,
  handleNewChat,
  mutate,
  setCurrentChatTitle,
}: Props) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);

  return (
    <div
      className={`
        ${isOpen ? 'w-64' : 'w-16 items-center'} 
        bg-[#181818] transition-all duration-300 overflow-hidden flex flex-col relative
      `}
    >
      {isOpen ? (
        <>
          <div className="p-6 pt-5 flex items-center justify-between w-full pb-2">
            <Image width={150} height={150} alt="Logo" src="/logo-full.svg" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer bg-transparent p-2 hover:bg-primary-gray600 rounded-md transition-colors"
            >
              <Image
                width={25}
                height={25}
                alt="Close sidebar"
                src="/off.svg"
              />
            </button>
          </div>

          <NewChatButton handleNewChat={handleNewChat} />

          <div className="flex-1 overflow-y-auto chat-scroll-container w-full">
            <h3 className="ml-6 mt-4 text-sm font-medium text-gray-400">
              Chats
            </h3>
            <div className="p-3 pt-2">
              {chatHistory?.map((chat) => (
                <ChatCard
                  key={chat.id}
                  chat={chat}
                  handleSelectChat={handleSelectChat}
                  currentChatId={currentChatId}
                  editingChatId={editingChatId}
                  setEditingChatId={setEditingChatId}
                  mutate={mutate}
                  setCurrentChatTitle={setCurrentChatTitle}
                />
              ))}
            </div>
          </div>

          <UserSection />
        </>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-transparent rounded-md hover:bg-gray-800 transition-colors"
        >
          <Image width={26} height={26} alt="Logo" src="/logo.svg" />
        </button>
      )}
    </div>
  );
};
