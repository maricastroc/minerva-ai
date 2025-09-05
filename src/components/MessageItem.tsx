import { ASSISTANT_ROLE, USER_ROLE } from '@/utils/constants';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageProps } from '@/types/message';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { useChat } from '@/hooks/useChat';
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';

export const MessageItem = ({ message }: { message: MessageProps }) => {
  const { handleRegenerate } = useChat();

  const { isMessageLoading } = useAppContext();

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateClick = async () => {
    if (isMessageLoading || isRegenerating) return;

    setIsRegenerating(true);
    try {
      await handleRegenerate(String(message.id));
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div
      className={`flex flex-1 w-full ${message.role === USER_ROLE || message.role === 'user' ? 'justify-end' : 'justify-start'} my-6`}
    >
      <div
        className={`rounded-2xl ${
          message.role === USER_ROLE || message.role === 'user'
            ? 'bg-[#303030] text-white max-w-xs md:max-w-md lg:max-w-lg p-4 py-2'
            : 'bg-transparent text-gray-100 p-4 py-2'
        }`}
      >
        <div className="text-base leading-[29px]">
          {message.role === ASSISTANT_ROLE || message.role === 'assistant' ? (
            <div className="flex flex-col justify-end items-start">
              <MarkdownRenderer content={message.content} />
              <div className="mt-[-0.5rem] flex gap-1">
                <button className="cursor-pointer rounded-md text-gray-200 p-[0.15rem] hover:bg-white/10">
                  <FontAwesomeIcon
                    className="text-primary-gray300"
                    icon={faCopy}
                  />
                </button>
                <button onClick={handleRegenerateClick}>
                  <ArrowClockwiseIcon
                    className="cursor-pointer rounded-md text-gray-200 p-[0.15rem] hover:bg-white/10"
                    size={24}
                  />
                </button>
              </div>
            </div>
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );
};
