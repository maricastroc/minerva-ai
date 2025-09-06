import { ChatProps } from '@/types/chat';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';
import { ChatCard } from './partials/ChatCard';
import { useScreenSize } from '@/hooks/useScreenSize';

interface ChatListProps {
  chatHistory: ChatProps[] | undefined;
  handleSelectChat: (id: string) => void;
  editingChatId: string | null;
  setEditingChatId: (id: string | null) => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>;
}

export const ChatList = ({
  chatHistory,
  handleSelectChat,
  editingChatId,
  setEditingChatId,
  mutate,
}: ChatListProps) => {
  const isMobile = useScreenSize(768);

  return (
    <div className="flex-1 chat-scroll-container overflow-y-auto px-3 w-full p-4">
      {chatHistory && chatHistory?.length > 0 && (
        <>
          <p
            className={`mt-2 font-medium text-gray-100 mb-2 ${isMobile ? 'text-base ml-3' : 'text-sm ml-3'}`}
          >
            Chats
          </p>
          {chatHistory?.map((chat) => (
            <ChatCard
              isMobile={isMobile}
              key={chat.id}
              chat={chat}
              handleSelectChat={handleSelectChat}
              editingChatId={editingChatId}
              setEditingChatId={setEditingChatId}
              mutate={mutate}
            />
          ))}
        </>
      )}
    </div>
  );
};
