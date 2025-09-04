import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';

export const SidebarHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between p-2">
    <Image width={130} height={130} alt="Logo" src="/logo-full.svg" />
    <button
      onClick={onClose}
      aria-label="Fechar menu"
      className="p-2 rounded-md hover:bg-gray-700 transition-colors"
    >
      <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-gray-400" />
    </button>
  </div>
);
