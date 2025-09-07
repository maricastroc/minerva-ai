import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  isDropdownOpen: boolean;
  isMobile: boolean;
  isSelected: boolean;
  setIsDropdownOpen: (value: boolean) => void;
}

export const DropdownButton = ({
  isDropdownOpen,
  isMobile,
  isSelected,
  setIsDropdownOpen,
}: Props) => {
  return (
    <button
      className={`cursor-pointer bg-transparent rounded-md py-2 mr-3 px-[0.1rem] flex items-center justify-center group-hover:opacity-100 hover:bg-dropdown-hover transition-opacity ${isMobile || isDropdownOpen || isSelected ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
      }}
    >
      <FontAwesomeIcon icon={faEllipsisVertical} className="w-3 h-3" />
    </button>
  );
};
