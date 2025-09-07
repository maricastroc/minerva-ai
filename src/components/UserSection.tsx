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

export const UserSection = ({ isMobile = false }: Props) => {
  const { data: session } = useSession();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstLetter = session?.user?.name?.[0] ?? '';

  useClickOutside([dropdownRef], () => setIsDropdownOpen(false));

  const handleLogout = useCallback(() => {
    setIsSettingsModalOpen(false);
    setIsDropdownOpen(false);
    signOut({ callbackUrl: '/login' });
    toast.success('See you soon!');
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const textClass = clsx(
    'truncate flex-1 text-gray-50 font-medium',
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
        aria-expanded={isDropdownOpen}
        className="flex items-center space-x-3 cursor-pointer transition-all duration-100 p-2 rounded-2xl hover:bg-user-card-hover relative"
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        <Avatar
          src={session?.user?.avatarUrl}
          alt={session?.user?.name ?? 'User avatar'}
          fallback={firstLetter}
        />

        <div className={textClass}>{session?.user?.name}</div>

        {isDropdownOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 p-2 w-48 bg-dropdown rounded-lg shadow-lg z-50"
            role="menu"
          >
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className={clsx(
                buttonClass,
                'text-gray-25 hover:bg-dropdown-hover'
              )}
              role="menuitem"
            >
              <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-3" />
              Settings
            </button>
            <div className="my-1" />
            <button
              onClick={handleLogout}
              className={clsx(buttonClass, 'text-delete hover:bg-delete/10')}
              role="menuitem"
            >
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
