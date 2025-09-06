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
      className={`flex bg-primary-button cursor-pointer justify-center
        rounded-3xl m-2 text-gray-50 duration-100 transition-all shadow-md items-center gap-2 font-semibold hover:bg-primary-button-hover
        py-[0.7rem] ${isMobile ? 'text-base' : 'text-sm mx-3'}`}
    >
      <FontAwesomeIcon icon={faPenToSquare} />
      New Chat
    </button>
  );
};
