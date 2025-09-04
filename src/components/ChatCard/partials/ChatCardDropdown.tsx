import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface DropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  isMobile?: boolean;
}

export const ChatCardDropdown = ({
  onEdit,
  onDelete,
  isMobile,
}: DropdownProps) => (
  <div className="absolute top-12 p-2 w-full flex items-start right-0 bg-primary-gray600 rounded-lg shadow-lg z-10 min-w-[120px]">
    <div className="py-1 w-full">
      <button
        className={`cursor-pointer w-full rounded-md text-left p-2 font-medium text-gray-200 hover:bg-primary-gray500 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'}`}
        onClick={onEdit}
      >
        <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
        Edit
      </button>

      <button
        className={`cursor-pointer rounded-md w-full text-left p-2 font-medium text-primary-red300 hover:bg-primary-gray500 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'}`}
        onClick={onDelete}
      >
        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
        Delete
      </button>
    </div>
  </div>
);
