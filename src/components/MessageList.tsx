import { useRef, useEffect } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className={`flex  flex-col pr-3 max-h-[65vh] sm:max-h-[80vh] chat-scroll-container overflow-y-auto w-full max-w-4xl bg-[#212020]`}
    >
      {!isMobile && currentChatTitle && (
        <div className="sticky top-0 z-10 bg-[#212020] w-full border-b border-[#303133] p-3 pt-1">
          <h1 className="text-base font-medium text-center text-white break-words line-clamp-2">
            {currentChatTitle}
          </h1>
        </div>
      )}

      <div className="mt-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>

      {isLoading && <LoadingComponent />}
      <div ref={messagesEndRef} />
    </div>
  );
};
