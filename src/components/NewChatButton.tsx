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
      className={`flex bg-primary-gray500 cursor-pointer justify-center rounded-3xl m-2 mx-3 text-gray-200 items-center gap-2 font-semibold hover:bg-primary-gray400 px-[1.1rem] py-[0.7rem] ${isMobile ? 'text-base' : 'text-sm'}`}
    >
      <FontAwesomeIcon icon={faPenToSquare} />
      New Chat
    </button>
  );
};
