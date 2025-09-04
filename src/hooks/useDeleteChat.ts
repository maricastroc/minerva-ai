/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';
import { ChatProps } from '@/types/chat';
import { api } from '@/lib/axios';
import { handleApiError } from '@/utils/handleApiError';
import { useAppContext } from '@/contexts/AppContext';

export const useDeleteChat = (
  mutate: KeyedMutator<AxiosResponse<ChatProps[], any>>
) => {
  const [loading, setLoading] = useState(false);

  const { currentChatId, handleCurrentChatId } = useAppContext();

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      setLoading(true);

      await api.delete(`/conversations/${chatId}`);

      await mutate();

      if (currentChatId === chatId) {
        handleCurrentChatId(null);
      }
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { deleteChat, loading };
};
