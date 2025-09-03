/* eslint-disable @typescript-eslint/no-explicit-any */
// SidebarMenu.tsx
import { ChatProps } from '@/types/chat';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { UserSection } from './UserSection';
import { NewChatButton } from './NewChatButton';
import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';
import { ChatCard } from './ChatCard';

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

export const MobileSidebar = ({
  isOpen,
  setIsOpen,
  chatHistory,
  handleNewChat,
  currentChatId,
  handleSelectChat,
  mutate,
  setCurrentChatTitle,
}: Props) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-40"
        />
      )}

      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed px-2 top-0 left-0 bottom-0 w-72 bg-[#181818] z-50 shadow-lg flex flex-col"
      >
        <div className="p-2 px-2 flex items-center justify-between">
          <Image width={22} height={22} alt="Logo" src="/logo.svg" />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <NewChatButton isMobile handleNewChat={handleNewChat} />

        <div className="flex-1 overflow-y-auto p-4 px-0">
          <p className="ml-2 mt-2 text-base font-medium text-gray-400 mb-2">
            Chats
          </p>
          {chatHistory?.map((chat) => (
            <ChatCard
              isMobile
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

        <UserSection isMobile />
      </motion.aside>
    </>
  );
};
