import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { AxiosResponse } from 'axios';
import { ChatProps } from '@/types/chat';
import { KeyedMutator } from 'swr';

interface DropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>;
  chatId: string;
  isMobile?: boolean;
  position: 'top' | 'bottom';
  onOpenDeleteModal: () => void;
}

export const ChatCardDropdown = ({
  onEdit,
  isMobile,
  position = 'bottom',
  onOpenDeleteModal
}: DropdownProps) => {
  const positionClasses = position === 'top' 
    ? 'bottom-full mb-2' 
    : 'top-full mt-[0.5rem]';

  return (
    <div className={`absolute ${positionClasses} p-2 w-full flex items-start right-0 bg-dropdown rounded-lg shadow-lg z-50 min-w-[120px]`}>
      <div className="py-1 w-full">
        <button
          className={`cursor-pointer w-full rounded-md text-left p-2 font-medium text-gray-50 hover:bg-dropdown-hover flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'}`}
          onClick={onEdit}
        >
          <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
          Edit
        </button>

        <button
          className={`cursor-pointer rounded-md w-full text-left p-2 font-medium text-delete hover:bg-delete/10 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'}`}
          onClick={onOpenDeleteModal}
        >
          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
};