import { useDebounce } from '@/hooks/useDebounce';
import { useUpdateChatTitle } from '@/hooks/useUpdateChatTitle';
import { useRef, useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatDate';
import { ChatProps } from '@/types/chat';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';
import { ChatTitleInput } from './ChatTitleInput';
import { ChatCardDropdown } from './ChatCardDropdown';
import { DropdownButton } from './DropdownButton';
import { useClickOutside } from '@/hooks/useClickOutside';
import clsx from 'clsx';
import { useAppContext } from '@/contexts/AppContext';

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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [localTitle, setLocalTitle] = useState(chat.title);

  const chatId = String(chat.id);
  const isEditing = editingChatId === chatId;
  const isSelected = currentChatId === chatId;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedTitle = useDebounce(localTitle, 500);

  const { updateChatTitle } = useUpdateChatTitle(mutate, currentChatId);

  useEffect(() => {
    if (isEditing && debouncedTitle !== chat.title && debouncedTitle.trim()) {
      updateChatTitle(chatId, debouncedTitle.trim());
    }
  }, [debouncedTitle, isEditing]);

  useClickOutside([inputRef], () => {
    if (isEditing) {
      if (localTitle.trim() && localTitle !== chat.title) {
        updateChatTitle(chatId, localTitle.trim());
      }
      setEditingChatId(null);
    }
  });

  const handleCardClick = () => {
    if (!isEditing) handleSelectChat(chatId);
  };

  return (
    <div
      className={clsx(
        'mt-1 w-full flex items-center justify-between cursor-pointer pr-0 py-2 rounded-2xl transition-colors group hover:bg-primary-gray600',
        {
          'bg-primary-gray650': isSelected || isDropdownOpen,
          'bg-primary-gray700': isEditing,
          'px-[0.8rem]': !isMobile,
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
                'text-gray-400',
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
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            isMobile={isMobile}
          />

          {isDropdownOpen && (
            <ChatCardDropdown
              onEdit={() => {
                setEditingChatId(chatId);
                setLocalTitle(chat.title);
                setIsDropdownOpen(false);
              }}
              onDelete={() => setIsDropdownOpen(false)}
              chatId={chatId}
              mutate={mutate}
              isMobile={isMobile}
            />
          )}
        </div>
      )}
    </div>
  );
};
