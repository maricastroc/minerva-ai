import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen';
import { useAppContext } from '@/contexts/AppContext';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  hasMessages: boolean;
  isMobile?: boolean;
  isSidebarOpen: boolean;
}

export const ChatInput = ({
  input,
  setInput,
  onSubmit,
  hasMessages,
  isSidebarOpen,
  isMobile = false,
}: ChatInputProps) => {
  const isKeyboardOpen = useKeyboardOpen();

  const { isMessageLoading } = useAppContext();

  return (
    <div
      className={`flex fixed w-full md:max-w-[75%] xl:max-w-4xl pb-4 pointer-events-none transition-transform duration-300 ${
        isKeyboardOpen ? 'translate-y-[-50%]' : ''
      } ${hasMessages || isMobile ? 'bottom-1 sm:bottom-4 pt-16 ' : 'pt-32'}`}
      style={{
        width: `${!isMobile ? `calc(100vw - ${isSidebarOpen ? '16rem' : '4rem'})` : '100vw'}`,
      }}
    >
      <form onSubmit={onSubmit} className=" w-full px-4 pointer-events-auto">
        <div className="flex items-center bg-primary-gray600 rounded-[1.5rem] sm:rounded-[3rem] p-1 sm:p-3 shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask minerva.ai anything"
            className="flex-1 px-4 py-2 focus:outline-none bg-transparent text-white placeholder-gray-400 text-base sm:text-lg"
            disabled={isMessageLoading}
            style={{ fontSize: '16px' }}
          />
          <button
            type="submit"
            disabled={isMessageLoading || !input.trim()}
            className={` text-white rounded-full mr-1 sm:mr-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/40 transition-colors min-w-[2rem] ${input.trim() ? 'bg-primary-blue500' : 'bg-white/30'}`}
          >
            <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
