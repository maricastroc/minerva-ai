import { SidebarSimpleIcon } from '@phosphor-icons/react';
import Image from 'next/image';

export const SidebarHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between p-4 pb-2">
    <Image width={130} height={130} alt="Logo" src="/logo-full.svg" />
    <button
      onClick={onClose}
      aria-label="Close menu"
      className="p-2 rounded-md hover:bg-gray-700 transition-colors"
    >
      <SidebarSimpleIcon className="text-primary-gray100" size={22} />
    </button>
  </div>
);
