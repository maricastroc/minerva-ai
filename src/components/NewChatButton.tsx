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
      className={`flex bg-primary-gray500 cursor-pointer justify-center
        rounded-3xl m-2 text-primary-gray50 items-center gap-2 font-semibold hover:bg-primary-gray400
        py-[0.7rem] ${isMobile ? 'text-base' : 'text-sm mx-3'}`}
    >
      <FontAwesomeIcon icon={faPenToSquare} />
      New Chat
    </button>
  );
};
