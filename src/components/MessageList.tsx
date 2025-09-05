import { MessageProps } from '@/types/message';
import { MessageItem } from './MessageItem';
import { LoadingComponent } from './LoadingComponent';
import { useAppContext } from '@/contexts/AppContext';

interface MessageListProps {
  messages: MessageProps[];
  isMobile: boolean;
}

export const MessageList = ({ messages, isMobile }: MessageListProps) => {
  const { currentChatTitle, isMessageLoading } = useAppContext();

  return (
    <div className={`flex flex-col h-[100dvh] w-full bg-primary-gray900`}>
      {!isMobile && currentChatTitle && (
        <div className="sticky top-0 z-10 bg-primary-gray900 w-full p-3 py-2">
          <h1 className="text-base font-medium text-center text-white break-words line-clamp-2">
            {currentChatTitle}
          </h1>
        </div>
      )}

      <div className="relative mt-4 pb-4 flex flex-col items-center w-full justify-start mb-36 chat-scroll-container overflow-y-auto">
        <div className="min-w-full xl:min-w-4xl xl:max-w-4xl">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}

          {isMessageLoading && (
            <div className="pl-4 mt-[-1.5rem] pb-[1.5rem] w-full flex justify-start">
              <LoadingComponent />
            </div>
          )}
        </div>
      </div>
      <div />
    </div>
  );
};
