import { ASSISTANT_ROLE, USER_ROLE } from '@/utils/constants';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageProps } from '@/types/message';
import { useChat } from '@/hooks/useChat';
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAudio } from '@/contexts/AudioContext';
import clsx from 'clsx';
import { IconButton } from './IconButton';
import { handleApiError } from '@/utils/handleApiError';
import {
  IconCancel,
  IconCheck,
  IconCopy,
  IconMicrophone,
  IconRotate,
} from '@tabler/icons-react';
import { Tooltip } from 'react-tooltip';

export const MessageItem = ({ message }: { message: MessageProps }) => {
  const { handleRegenerate } = useChat();

  const [copied, setCopied] = useState(false);

  const { isMessageLoading } = useAppContext();

  const { isSpeaking, currentSpeakingText, speak, stop } = useAudio();

  const isUserMessage = message.role === USER_ROLE || message.role === 'user';

  const isAssistantMessage =
    message.role === ASSISTANT_ROLE || message.role === 'assistant';

  const isThisMessageSpeaking =
    isSpeaking && currentSpeakingText === message.content;

  const handleRegenerateClick = async () => {
    if (isMessageLoading) return;

    handleRegenerate(String(message.id));
  };

  const handleAudioClick = () => {
    if (isThisMessageSpeaking) {
      stop();
    } else {
      speak(message.content);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);

      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div
      className={clsx(
        'flex flex-1 w-full my-6',
        isUserMessage ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'rounded-2xl p-4 py-2',
          isUserMessage
            ? 'bg-[#303030] text-white max-w-xs md:max-w-md lg:max-w-lg'
            : 'bg-transparent text-gray-100'
        )}
      >
        <div className="text-base leading-[29px]">
          {isAssistantMessage ? (
            <div className="flex flex-col justify-end items-start">
              <MarkdownRenderer content={message.content} />
              <div className="mt-[-0.2rem] flex gap-2">
                <IconButton onClick={handleCopy}>
                  {copied ? (
                    <IconCheck size={20} />
                  ) : (
                    <IconCopy
                      data-tooltip-id={'copy'}
                      data-tooltip-content={'Copy'}
                      size={20}
                    />
                  )}
                </IconButton>

                <IconButton onClick={handleRegenerateClick}>
                  <IconRotate
                    data-tooltip-id={'regenerate'}
                    data-tooltip-content={'Regenerate'}
                    size={20}
                  />
                </IconButton>

                <IconButton onClick={handleAudioClick}>
                  {isThisMessageSpeaking ? (
                    <IconCancel
                      data-tooltip-id={'stop'}
                      data-tooltip-content={'Stop'}
                      size={20}
                    />
                  ) : (
                    <IconMicrophone
                      data-tooltip-id={'audio'}
                      data-tooltip-content={'Read aloud'}
                      size={20}
                    />
                  )}
                </IconButton>

                <Tooltip
                  id={'audio'}
                  place="bottom"
                  className="custom-tooltip"
                />

                <Tooltip
                  id={'stop'}
                  place="bottom"
                  className="custom-tooltip"
                />

                <Tooltip
                  id={'regenerate'}
                  place="bottom"
                  className="custom-tooltip"
                />

                <Tooltip
                  id={'copy'}
                  place="bottom"
                  className="custom-tooltip"
                />
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
