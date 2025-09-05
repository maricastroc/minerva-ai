import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DeleteChatModal } from '@/components/DeleteChatModal';
import { useState } from 'react';
import { AxiosResponse } from 'axios';
import { ChatProps } from '@/types/chat';
import { KeyedMutator } from 'swr';

interface DropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>;
  chatId: string;
  isMobile?: boolean;
}

export const ChatCardDropdown = ({
  onEdit,
  onDelete,
  mutate,
  chatId,
  isMobile,
}: DropdownProps) => {
  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);

  return (
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
          onClick={() => setIsDeleteChatModalOpen(true)}
        >
          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
          Delete
        </button>
        <DeleteChatModal
          mutate={mutate}
          chatId={chatId}
          isOpen={isDeleteChatModalOpen}
          onClose={() => {
            setIsDeleteChatModalOpen(false);
            onDelete();
          }}
        />
      </div>
    </div>
  );
};
