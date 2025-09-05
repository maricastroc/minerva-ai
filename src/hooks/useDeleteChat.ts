import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';
import { ChatProps } from '@/types/chat';
import { api } from '@/lib/axios';
import { handleApiError } from '@/utils/handleApiError';
import { useAppContext } from '@/contexts/AppContext';

export const useDeleteChat = (
  chatId: string,
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>
) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    currentChatId,
    handleCurrentChatTitle,
    handleCurrentChatId,
    handleMessages,
  } = useAppContext();

  const deleteChat = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await api.delete(`/user/chats/${chatId}/delete`);

      await mutate();

      if (currentChatId === chatId) {
        handleCurrentChatId(null);
        handleCurrentChatTitle(null);
        handleMessages([]);
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteChat, isLoading };
};
