import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  isMobile?: boolean;
}

export const UserSection = ({ isMobile = false }: Props) => {
  const { data: session } = useSession();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstLetter = session?.user?.name?.split(' ')[0].charAt(0);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: '/login' });

    toast.success('See you soon!');
  }, []);

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${isMobile ? 'p-4 px-0 pb-2' : 'p-4'} w-full`}>
      <div
        className="flex items-center space-x-3 cursor-pointer p-2 rounded-2xl hover:bg-primary-gray600 relative"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        ref={dropdownRef}
      >
        <div className="w-7 h-7 rounded-full bg-primary-purple500 flex items-center justify-center">
          <span className="text-sm font-medium">{firstLetter}</span>
        </div>
        <div
          className={`truncate flex-1 ${isMobile ? 'text-base' : 'text-sm'}`}
        >
          {session?.user?.name}
        </div>

        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 mb-2 p-2 w-48 bg-primary-gray600 rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={handleSettingsClick}
                className={`cursor-pointer flex items-center rounded-lg w-full p-2 text-gray-200 hover:bg-primary-gray400 transition-colors ${isMobile ? 'text-base' : 'text-sm'}`}
              >
                <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-3" />
                Settings
              </button>
              <div className="my-1"></div>
              <button
                onClick={handleLogout}
                className={`cursor-pointer flex items-center rounded-lg w-full p-2 text-gray-200 hover:bg-primary-gray400 transition-colors ${isMobile ? 'text-base' : 'text-sm'}`}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
