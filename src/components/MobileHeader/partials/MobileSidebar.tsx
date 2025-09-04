/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatProps } from '@/types/chat';
import { motion } from 'framer-motion';

import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';
import { NewChatButton } from '@/components/NewChatButton';
import { UserSection } from '@/components/UserSection';
import { SidebarHeader } from './SidebarHeader';
import { ChatList } from '@/components/ChatList';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (value: string) => void;
  handleNewChat: () => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[], any>>;
  setCurrentChatTitle: (value: string) => void;
}

export const MobileSidebar = ({
  isOpen,
  setIsOpen,
  chatHistory,
  handleNewChat,
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
        <SidebarHeader onClose={() => setIsOpen(false)} />

        <NewChatButton isMobile handleNewChat={handleNewChat} />

        <ChatList
          chatHistory={chatHistory}
          handleSelectChat={handleSelectChat}
          editingChatId={editingChatId}
          setEditingChatId={setEditingChatId}
          mutate={mutate}
          setCurrentChatTitle={setCurrentChatTitle}
        />

        <UserSection isMobile />
      </motion.aside>
    </>
  );
};
