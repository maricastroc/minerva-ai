import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  handleNewChat: () => void;
  isMobile?: boolean;
}

export const NewChatButton = ({ handleNewChat, isMobile = false }: Props) => {
  return (
    <button
      onClick={handleNewChat}
      className={`flex cursor-pointer rounded-xl m-2 text-gray-200 items-center gap-2 font-semibold hover:bg-primary-gray600 ${isMobile ? 'p-0 pt-2 text-base' : 'px-[1.1rem] py-2 text-sm'}`}
    >
      <FontAwesomeIcon icon={faPenToSquare} />
      New Chat
    </button>
  );
};
