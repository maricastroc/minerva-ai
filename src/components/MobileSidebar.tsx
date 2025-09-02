// SidebarMenu.tsx
import { ChatProps } from '@/types/chat';
import { formatDate } from '@/utils/formatDate';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { UserSection } from './UserSection';
import { NewChatButton } from './NewChatButton';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (value: string) => void;
  currentChatId: string | null;
  handleNewChat: () => void;
}

export const MobileSidebar = ({
  isOpen,
  setIsOpen,
  chatHistory,
  handleNewChat,
  currentChatId,
  handleSelectChat,
}: Props) => {
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
          <p className="ml-2 mt-2 text-sm font-medium text-gray-400 mb-2">
            Chats
          </p>
          {chatHistory?.map((chat) => (
            <div
              key={chat.id}
              className={`hover:bg-primary-gray600 cursor-pointer px-[0.6rem] py-2 rounded-xl transition-colors ${currentChatId === chat?.id && 'bg-primary-gray650'}`}
              onClick={() => {
                handleSelectChat(String(chat?.id));
                setIsOpen(false);
              }}
            >
              <div className="text-sm font-medium truncate text-white">
                {chat.title}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(chat.createdAt || chat.updatedAt)}
              </div>
            </div>
          ))}
        </div>

        <UserSection isMobile />
      </motion.aside>
    </>
  );
};
