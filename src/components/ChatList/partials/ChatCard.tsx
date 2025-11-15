import { useDebounce } from '@/hooks/useDebounce';
import { useUpdateChatTitle } from '@/hooks/useUpdateChatTitle';
import { useRef, useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatDate';
import { ChatProps } from '@/types/chat';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';
import { ChatTitleInput } from './ChatTitleInput';

import { DropdownButton } from './DropdownButton';
import { useClickOutside } from '@/hooks/useClickOutside';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';
import { useDropdownManager } from '@/contexts/DropdownContext';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { DeleteChatModal } from '@/components/DeleteChatModal';
import { ChatCardDropdown } from './ChatCardDropdown';

interface Props {
  chat: ChatProps;
  handleSelectChat: (value: string) => void;
  editingChatId: string | null;
  setEditingChatId: (id: string | null) => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>;
  isMobile?: boolean;
}

export const ChatCard = ({
  chat,
  handleSelectChat,
  editingChatId,
  setEditingChatId,
  mutate,
  isMobile = false,
}: Props) => {
  const { currentChatId } = useAppContext();
  const { 
    toggleChatDropdown, 
    closeAllDropdowns,
    isChatDropdownOpen 
  } = useDropdownManager();

  const [localTitle, setLocalTitle] = useState(chat.title);

  const [isDeleteChatModalOpen, setIsDeleteChatModalOpen] = useState(false);
  
  const chatId = String(chat.id);

  const isEditing = editingChatId === chatId;

  const isSelected = currentChatId === chatId;

  const isThisChatDropdownOpen = isChatDropdownOpen(chatId);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const { dropdownPosition } = useDropdownPosition({
    dropdownRef: cardRef,
    isOpen: isThisChatDropdownOpen
  });

  const debouncedTitle = useDebounce(localTitle, 500);
  const { updateChatTitle } = useUpdateChatTitle(mutate, currentChatId);

  useEffect(() => {
    if (isEditing && debouncedTitle !== chat.title && debouncedTitle.trim()) {
      updateChatTitle(chatId, debouncedTitle.trim());
    }
  }, [debouncedTitle, isEditing]);

  useClickOutside([inputRef, dropdownRef], () => {
    if (isEditing) {
      if (localTitle.trim() && localTitle !== chat.title) {
        updateChatTitle(chatId, localTitle.trim());
      }
      setEditingChatId(null);
    }
    if (isThisChatDropdownOpen) {
      closeAllDropdowns();
    }
  });

  const handleCardClick = () => {
    if (!isEditing) {
      handleSelectChat(chatId);
      closeAllDropdowns();
    }
  };

  const handleToggleChatDropdown = () => {
    toggleChatDropdown(chatId);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteChatModalOpen(true);
    closeAllDropdowns();
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteChatModalOpen(false);
  };

  return (
    <>
      <div
        ref={cardRef}
        className={clsx(
          'mt-1 pl-[0.8rem] flex items-center justify-between cursor-pointer py-2 rounded-[1.25rem] transition-colors group',
          {
            'hover:bg-chat-card-hover': !isSelected,
            'bg-selected-chat-card': isSelected || isThisChatDropdownOpen,
            'bg-gray-700': isEditing,
          }
        )}
        onClick={handleCardClick}
      >
        <div className="flex flex-col flex-1 min-w-0">
          {isEditing ? (
            <ChatTitleInput
              ref={inputRef}
              value={localTitle}
              setValue={setLocalTitle}
              onSave={() => {
                updateChatTitle(chatId, debouncedTitle);
                setEditingChatId(null);
              }}
              onCancel={() => setEditingChatId(null)}
              isMobile={isMobile}
            />
          ) : (
            <>
              <div
                className={clsx(
                  'font-medium truncate',
                  isMobile ? 'text-base' : 'text-sm'
                )}
              >
                {chat.title}
              </div>
              <div
                className={clsx(
                  'text-gray-100',
                  isMobile ? 'text-sm' : 'text-xs'
                )}
              >
                {formatDate(chat.updatedAt || chat.createdAt)}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="relative" ref={dropdownRef}>
            <DropdownButton
              isDropdownOpen={isThisChatDropdownOpen}
              setIsDropdownOpen={handleToggleChatDropdown}
              isMobile={isMobile}
              isSelected={isSelected}
            />

            {isThisChatDropdownOpen && (
              <ChatCardDropdown
                position={dropdownPosition}
                onEdit={() => {
                  setEditingChatId(chatId);
                  setLocalTitle(chat.title);
                  closeAllDropdowns();
                }}
                onDelete={() => closeAllDropdowns()}
                onOpenDeleteModal={handleOpenDeleteModal}
                chatId={chatId}
                mutate={mutate}
                isMobile={isMobile}
              />
            )}
          </div>
        )}
      </div>

      <DeleteChatModal
        mutate={mutate}
        chatId={chatId}
        isOpen={isDeleteChatModalOpen}
        onClose={handleCloseDeleteModal}
      />
    </>
  );
};