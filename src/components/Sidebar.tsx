import { ChatProps } from '@/types/chat';
import { formatDate } from '@/utils/formatDate';
import Image from 'next/image';
import { faPenToSquare, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useScreenSize } from '@/hooks/useScreenSize';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (value: string) => void;
  currentChatId: string | null;
  handleNewChat: () => void;
}

export const Sidebar = ({
  chatHistory,
  isOpen,
  currentChatId,
  setIsOpen,
  handleSelectChat,
  handleNewChat,
}: Props) => {
  const isMobile = useScreenSize(480);

  return (
    <div
      className={`
        ${isMobile ? 'w-64 h-full' : isOpen ? 'w-64' : 'w-16 items-center'} 
        bg-[#181818] transition-all duration-300 overflow-hidden flex flex-col
      `}
    >
      {isOpen ? (
        <>
          <div className="p-6 flex items-center justify-between w-full pb-2">
            {isMobile ? (
              <>
                <Image
                  width={130}
                  height={130}
                  alt="Logo"
                  src="/logo-full.svg"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-transparent p-2 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Image
                  width={150}
                  height={150}
                  alt="Logo"
                  src="/logo-full.svg"
                />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="cursor-pointer bg-transparent p-2 hover:bg-primary-gray600 rounded-md transition-colors"
                >
                  <Image
                    width={25}
                    height={25}
                    alt="Fechar sidebar"
                    src="/off.svg"
                  />
                </button>
              </>
            )}
          </div>

          <button
            onClick={handleNewChat}
            className="flex text-sm cursor-pointer rounded-xl m-2 text-gray-200 items-center gap-2 px-[1.1rem] py-2 font-semibold hover:bg-primary-gray600"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto chat-scroll-container w-full">
            <h3 className="ml-6 mt-4 text-sm font-medium text-gray-400">
              Chats
            </h3>
            <div className="p-3 pt-2">
              {chatHistory?.map((chat) => (
                <div
                  key={chat.id}
                  className={`hover:bg-primary-gray600 cursor-pointer px-[0.8rem] py-2 rounded-2xl transition-colors ${currentChatId === chat?.id && 'bg-primary-gray650'}`}
                  onClick={() => handleSelectChat(String(chat.id))}
                >
                  <div className="text-sm font-medium truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(chat?.updatedAt || chat?.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-700 w-full">
            <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium">U</span>
              </div>
              <div className="text-sm">User</div>
            </div>
          </div>
        </>
      ) : (
        !isMobile && (
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 bg-transparent rounded-md hover:bg-gray-800 transition-colors"
          >
            <Image width={26} height={26} alt="Logo" src="/logo.svg" />
          </button>
        )
      )}
    </div>
  );
};
