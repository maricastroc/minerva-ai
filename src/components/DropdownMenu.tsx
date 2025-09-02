import { ChatProps } from '@/types/chat';
import { formatDate } from '@/utils/formatDate';

interface Props {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  chatHistory: ChatProps[];
}

export const DropdownMenu = ({ chatHistory, setIsOpen }: Props) => {
  return (
    <div className="fixed top-16 left-4 right-4 bg-[#181818] border border-[#303133] rounded-lg z-50 shadow-lg">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Chat History</h3>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="hover:bg-gray-700 cursor-pointer p-3 rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-sm font-medium truncate text-white">
                {chat.title}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(chat.date)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 p-2 rounded-md">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
            <div className="text-sm text-white">User</div>
          </div>
        </div>
      </div>
    </div>
  );
};
