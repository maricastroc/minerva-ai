import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut, useSession } from 'next-auth/react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { SettingsModal } from './SettingsModal';

interface Props {
  isMobile?: boolean;
}

export const UserSection = ({ isMobile = false }: Props) => {
  const { data: session } = useSession();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstLetter = session?.user?.name?.[0] ?? '';

  useClickOutside([dropdownRef], () => setIsDropdownOpen(false));

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/login' });
    toast.success('See you soon!');
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const textClass = clsx(
    'truncate flex-1 text-gray-50',
    isMobile ? 'text-base' : 'text-sm'
  );

  const buttonClass = clsx(
    'cursor-pointer flex items-center rounded-lg w-full p-2 text-gray-25 hover:bg-gray-400 transition-colors',
    isMobile ? 'text-base' : 'text-sm'
  );

  const Avatar = () =>
    session?.user?.avatarUrl ? (
      <Image
        className="rounded-full"
        width={28}
        height={28}
        src={session.user.avatarUrl}
        alt={session.user.name ?? 'User avatar'}
      />
    ) : (
      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
        <span className="text-sm font-medium">{firstLetter}</span>
      </div>
    );

  return (
    <div className={clsx(isMobile ? 'p-4 pb-2' : 'p-4', 'w-full')}>
      <div
        className="flex items-center space-x-3 cursor-pointer transition-all duration-100 p-2 rounded-2xl hover:bg-user-card-hover relative"
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        <Avatar />
        <div className={textClass}>{session?.user?.name}</div>

        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 mb-2 p-2 w-48 bg-gray-600 rounded-lg shadow-lg z-50">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className={buttonClass}
            >
              <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-3" />
              Settings
            </button>
            <div className="my-1"></div>
            <button onClick={handleLogout} className={buttonClass}>
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        )}

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </div>
    </div>
  );
};
