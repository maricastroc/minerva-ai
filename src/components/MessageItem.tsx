import { formatTime } from '@/utils/formatTime';
import { FormattedMessage } from './FormattedMessage';
import { MessageProps } from '@/types/message';

export const MessageItem = ({ message }: { message: MessageProps }) => (
  <div
    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div
      className={`rounded-2xl ${
        message.role === 'user'
          ? 'bg-[#303030] text-white max-w-xs md:max-w-md lg:max-w-lg p-4'
          : 'bg-transparent text-gray-100 p-4'
      }`}
    >
      <div className="text-base whitespace-pre-wrap leading-[29px]">
        <FormattedMessage content={message.content} />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {formatTime(message.timestamp)}
      </div>
    </div>
  </div>
);
