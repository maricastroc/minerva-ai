import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';

interface MobileHeaderProps {
  currentChatTitle: string | null;
  onMenuToggle: () => void;
}

export const MobileHeader = ({
  currentChatTitle,
  onMenuToggle,
}: MobileHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#181818] p-4 border-b border-[#303133]">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
        </button>
        {currentChatTitle ? (
          <h1 className="text-base font-medium text-white break-words line-clamp-1 flex-1 mx-4 text-center">
            {currentChatTitle}
          </h1>
        ) : (
          <div className="flex-1 mx-4 flex justify-center">
            <Image width={140} height={140} alt="Logo" src="/logo-full.svg" />
          </div>
        )}
        <div className="w-10"></div>
      </div>
    </div>
  );
};
