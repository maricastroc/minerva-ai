import { MessageProps } from '@/types/message';
import { MessageItem } from './MessageItem';
import { LoadingComponent } from './LoadingComponent';

interface MessageListProps {
  messages: MessageProps[];
  isLoading: boolean;
  currentChatTitle: string | null;
  isMobile: boolean;
}

export const MessageList = ({
  messages,
  isLoading,
  currentChatTitle,
  isMobile,
}: MessageListProps) => {
  return (
    <div className={`flex flex-col h-[100dvh] w-full bg-[#212020]`}>
      {!isMobile && currentChatTitle && (
        <div className="sticky top-0 z-10 bg-[#212020] w-full border-b border-[#303133] p-3 pt-1">
          <h1 className="text-base font-medium text-center text-white break-words line-clamp-2">
            {currentChatTitle}
          </h1>
        </div>
      )}

      <div className="mt-4 flex items-start w-full justify-center mb-28 chat-scroll-container overflow-y-auto">
        <div className="max-w-4xl pb-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </div>

      {isLoading && <LoadingComponent />}
      <div />
    </div>
  );
};
