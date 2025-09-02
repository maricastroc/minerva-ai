import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({
  input,
  setInput,
  isLoading,
  onSubmit,
}: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl mb-1 sm:mb-3 mt-4">
      <div className="flex items-center bg-primary-gray600 rounded-[1.5rem] sm:rounded-[3rem] p-1 sm:p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask simplechat.ai anything"
          className="flex-1 px-4 py-2 focus:outline-none bg-transparent text-white placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-white/30 text-white rounded-full mr-1 sm:mr-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/40 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowUp} className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
