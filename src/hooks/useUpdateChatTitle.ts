import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';
import { ChatProps } from '@/types/chat';
import { api } from '@/lib/axios';
import { handleApiError } from '@/utils/handleApiError';
import { useAppContext } from '@/contexts/AppContext';

export const useUpdateChatTitle = (
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>,
  currentChatId: string | null
) => {
  const { handleCurrentChatTitle } = useAppContext();

  const [loading, setLoading] = useState(false);

  const updateChatTitle = async (
    chatId: string,
    newTitle: string
  ): Promise<ChatProps | null> => {
    try {
      setLoading(true);

      const response = await api.patch<{ data: ChatProps }>(
        `/user/chats/${chatId}/title`,
        { title: newTitle }
      );

      if (response?.data) {
        await mutate();

        if (currentChatId === chatId) {
          handleCurrentChatTitle(newTitle);
        }

        return response.data.data;
      }

      return null;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateChatTitle, loading };
};
