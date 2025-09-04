/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDebounce } from '@/hooks/useDebounce';
import { useUpdateChatTitle } from '@/hooks/useUpdateChatTitle';
import { useEffect, useRef, useState } from 'react';
import { ChatTitleInput } from './partials/ChatTitleInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { ChatCardDropdown } from './partials/ChatCardDropdown';
import { formatDate } from '@/utils/formatDate';
import { ChatProps } from '@/types/chat';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';

interface Props {
  chat: ChatProps;
  currentChatId: string | null;
  handleSelectChat: (value: string) => void;
  editingChatId: string | null;
  setEditingChatId: (id: string | null) => void;
  mutate: KeyedMutator<AxiosResponse<ChatProps[], any>>;
  setCurrentChatTitle: (value: string) => void;
  isMobile?: boolean;
}

export const ChatCard = ({
  currentChatId,
  chat,
  handleSelectChat,
  editingChatId,
  setEditingChatId,
  mutate,
  setCurrentChatTitle,
  isMobile = false,
}: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [localTitle, setLocalTitle] = useState(chat.title);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isEditing = editingChatId === chat.id;
  const isSelected = currentChatId === chat.id;

  const debouncedTitle = useDebounce(localTitle, 500);

  const inputRef = useRef<HTMLInputElement>(null);

  const { updateChatTitle } = useUpdateChatTitle(
    mutate,
    setCurrentChatTitle,
    currentChatId
  );

  useEffect(() => {
    if (isEditing && debouncedTitle !== chat.title && debouncedTitle.trim()) {
      updateChatTitle(String(chat.id), debouncedTitle.trim());
    }
  }, [debouncedTitle, isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Fecha o dropdown se clicou fora
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }

      // Fecha o modo de edição se clicou fora do input
      if (isEditing && inputRef.current && !inputRef.current.contains(target)) {
        // Salva a edição
        if (localTitle.trim() && localTitle !== chat.title) {
          updateChatTitle(String(chat.id), localTitle.trim());
        }
        setEditingChatId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, localTitle, chat.title, chat.id]);

  const handleCardClick = () => {
    if (!isEditing) handleSelectChat(String(chat.id));
  };

  return (
    <div
      className={`mt-1 w-full flex items-center justify-between hover:bg-primary-gray600 cursor-pointer pr-0 px-[0.8rem] py-2 rounded-2xl transition-colors group ${isSelected || isDropdownOpen ? 'bg-primary-gray650' : ''} ${isEditing ? 'bg-primary-gray700' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex flex-col align-start flex-1 min-w-0">
        {isEditing ? (
          <ChatTitleInput
            ref={inputRef}
            value={localTitle}
            setValue={setLocalTitle}
            onSave={() => {
              updateChatTitle(String(chat.id), debouncedTitle);
              setEditingChatId(null);
            }}
            onCancel={() => setEditingChatId(null)}
            isMobile={isMobile}
          />
        ) : (
          <>
            <div
              className={`font-medium truncate ${isMobile ? 'text-base' : 'text-sm'}`}
            >
              {chat.title}
            </div>
            <div
              className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400`}
            >
              {formatDate(chat?.updatedAt || chat?.createdAt)}
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="relative">
          <button
            className={`cursor-pointer bg-transparent rounded-md py-2 mr-3 px-[0.1rem] flex items-center justify-center group-hover:opacity-100 hover:bg-primary-gray800 transition-opacity ${isMobile || isDropdownOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} className="w-3 h-3" />
          </button>

          {isDropdownOpen && (
            <div ref={dropdownRef}>
              <ChatCardDropdown
                onEdit={() => {
                  setEditingChatId(String(chat.id));
                  setLocalTitle(chat.title);
                  setIsDropdownOpen(false);
                }}
                onDelete={() => {
                  setIsDropdownOpen(false);
                }}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
