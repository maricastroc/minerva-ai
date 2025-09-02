import { ChatProps } from '@/types/chat';
import { formatDate } from '@/utils/formatDate';
import Image from 'next/image';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useScreenSize } from '@/hooks/useScreenSize';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  chatHistory: ChatProps[];
}

export const Sidebar = ({ chatHistory, isOpen, setIsOpen }: Props) => {
  const isMobile = useScreenSize(480);

  return (
    <div
      className={`
        ${isMobile ? 'w-64 h-full' : isOpen ? 'w-64' : 'w-16 items-center'} 
        bg-[#181818] p-2 transition-all duration-300 overflow-hidden flex flex-col
      `}
    >
      {isOpen ? (
        <>
          <div className="p-4 flex items-center justify-between w-full">
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
                  width={130}
                  height={130}
                  alt="Logo"
                  src="/logo-full.svg"
                />
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="bg-transparent p-2 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Image
                    width={20}
                    height={20}
                    alt="Fechar sidebar"
                    src="/off.svg"
                  />
                </button>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 w-full">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Chat History
            </h3>
            <div className="mt-4 space-y-4">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="hover:bg-gray-700 cursor-pointer p-2 rounded-md transition-colors"
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <div className="text-sm font-medium truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(chat.date)}
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
