/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatProps } from '@/types/chat';
import { formatDate } from '@/utils/formatDate';
import {
  faEllipsisVertical,
  faTrash,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';

interface Props {
  chat: ChatProps;
  currentChatId: string | null;
  handleSelectChat: (value: string) => void;
  onEditChat?: (id: string, newTitle: string) => void;
  onDeleteChat?: (id: string) => void;
  onCopyChat?: (id: string) => void;
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
  onEditChat,
  onDeleteChat,
  onCopyChat,
  editingChatId,
  setEditingChatId,
  mutate,
  setCurrentChatTitle,
  isMobile = false,
}: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [localTitle, setLocalTitle] = useState(chat.title);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = editingChatId === chat.id;

  const isSelected = currentChatId === chat.id;

  const debouncedTitle = useDebounce(localTitle, 500);

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/user/chats/${chatId}/title`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      const data = await response.json();

      mutate();

      if (isSelected) {
        setCurrentChatTitle(debouncedTitle);
      }

      return data;
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      if (
        isEditing &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        handleSaveEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && debouncedTitle !== chat.title && debouncedTitle.trim()) {
      updateChatTitle(String(chat.id), debouncedTitle.trim());
    }
  }, [debouncedTitle, isEditing, chat.title, chat.id, onEditChat]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEllipsisClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    setEditingChatId(String(chat.id));
    setLocalTitle(chat.title);
  };

  const handleSaveEdit = () => {
    if (localTitle.trim() && localTitle !== chat.title) {
      onEditChat?.(String(chat.id), localTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setLocalTitle(chat.title);
      setEditingChatId(null);
    }
  };

  const handleDropdownAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    setIsDropdownOpen(false);

    switch (action) {
      case 'delete':
        onDeleteChat?.(String(chat.id));
        break;
      case 'copy':
        onCopyChat?.(String(chat.id));
        break;
    }
  };

  const handleCardClick = () => {
    if (!isEditing) {
      handleSelectChat(String(chat.id));
    }
  };

  return (
    <div
      key={chat.id}
      className={`mt-1 w-full flex items-center justify-between hover:bg-primary-gray600 cursor-pointer pr-0 px-[0.8rem] py-2 rounded-2xl transition-colors group ${(currentChatId === chat?.id || isDropdownOpen) && 'bg-primary-gray650'} ${isEditing && 'bg-primary-gray700'}`}
      onClick={handleCardClick}
    >
      <div className="flex flex-col align-start flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={localTitle}
            spellCheck={false}
            onChange={(e) => setLocalTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`flex-1 bg-transparent text-white focus:outline-none ${isMobile ? 'text-base' : 'text-sm'}`}
            onClick={(e) => e.stopPropagation()}
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
            onClick={handleEllipsisClick}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} className="w-3 h-3" />
          </button>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className={`absolute top-12 p-2 w-full flex items-start right-0 bg-primary-gray600 rounded-lg shadow-lg z-10 min-w-[120px]`}
            >
              <div className="py-1 w-full">
                <button
                  className={`cursor-pointer w-full rounded-md text-left p-2 font-medium text-gray-200 hover:bg-primary-gray500 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'}`}
                  onClick={handleEditClick}
                >
                  <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                  Edit
                </button>

                <button
                  className={`cursor-pointer rounded-md w-full text-left p-2 font-medium  text-primary-red300 hover:bg-primary-gray500 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'}`}
                  onClick={(e) => handleDropdownAction(e, 'delete')}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
