import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut, useSession } from 'next-auth/react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { SettingsModal } from './SettingsModal';
import { useDropdownManager } from '@/contexts/DropdownContext';
import { ChatProps } from '@/types/chat';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';

interface Props {
  isMobile?: boolean;
  mutateChats: KeyedMutator<AxiosResponse<ChatProps[]>>;
}

const Avatar = ({
  src,
  alt,
  fallback,
}: {
  src?: string;
  alt?: string;
  fallback: string;
}) =>
  src ? (
    <Image
      className="rounded-full"
      width={28}
      height={28}
      src={src}
      alt={alt ?? 'User avatar'}
    />
  ) : (
    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
      <span className="text-sm font-medium">{fallback}</span>
    </div>
  );

export const UserSection = ({ isMobile = false, mutateChats }: Props) => {
  const { data: session } = useSession();

  const { 
    toggleUserDropdown, 
    closeAllDropdowns,
    isUserDropdownOpen 
  } = useDropdownManager();

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstLetter = session?.user?.name?.[0] ?? '';

  useClickOutside([dropdownRef], () => {
    if (isUserDropdownOpen) {
      closeAllDropdowns();
    }
  });

  const handleLogout = useCallback(() => {
    setIsSettingsModalOpen(false);

    closeAllDropdowns();

    signOut({ callbackUrl: '/login' });

    toast.success('See you soon!');
  }, [closeAllDropdowns]);

  const openSettingsModal = () => {
    closeAllDropdowns();
    
    setIsSettingsModalOpen(true);
  };

  const textClass = clsx(
    'truncate flex-1 text-gray-50',
    isMobile ? 'text-base' : 'text-sm'
  );

  const buttonClass = clsx(
    'cursor-pointer flex transition-all duration-100 items-center rounded-lg w-full p-2 transition-colors',
    isMobile ? 'text-base' : 'text-sm'
  );

  return (
    <div className={clsx(isMobile ? 'p-4 pb-2' : 'p-4', 'w-full')}>
      <div
        role="button"
        aria-expanded={isUserDropdownOpen}
        className={`flex items-center space-x-3 cursor-pointer transition-all duration-100 p-2 rounded-2xl relative ${!isUserDropdownOpen && 'hover:bg-user-card-hover'}`}
        onClick={toggleUserDropdown}
        ref={dropdownRef}
      >
        <Avatar
          src={session?.user?.avatarUrl}
          alt={session?.user?.name ?? 'User avatar'}
          fallback={firstLetter}
        />

        <div className={textClass}>{session?.user?.name}</div>

        {isUserDropdownOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 p-2 w-48 bg-dropdown rounded-lg shadow-lg z-50"
            role="menu"
          >
            <button
              onClick={openSettingsModal}
              className={clsx(
                buttonClass,
                'text-gray-25 hover:bg-dropdown-hover font-medium'
              )}
              role="menuitem"
            >
              <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-3" />
              Settings
            </button>
            <div className="my-1" />
            <button
              onClick={handleLogout}
              className={clsx(buttonClass, 'text-delete font-medium hover:bg-delete/10')}
              role="menuitem"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        )}

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => {
            setIsSettingsModalOpen(false);
            closeAllDropdowns();
          }}
          mutateChats={mutateChats}
        />
      </div>
    </div>
  );
};