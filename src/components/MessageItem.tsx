import { MarkdownRenderer } from './MarkdownRenderer';
import { MessageProps } from '@/types/message';

export const MessageItem = ({ message }: { message: MessageProps }) => (
  <div
    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div
      className={`rounded-2xl ${
        message.role === 'user'
          ? 'bg-[#303030] text-white max-w-xs md:max-w-md lg:max-w-lg p-4 py-2'
          : 'bg-transparent text-gray-100 p-4 py-2'
      }`}
    >
      <div className="text-base leading-[29px]">
        {message.role === 'assistant' ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          message.content
        )}
      </div>
    </div>
  </div>
);
