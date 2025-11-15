import { useCallback, useState } from 'react';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';
import { ChatProps } from '@/types/chat';
import { api } from '@/lib/axios';
import { handleApiError } from '@/utils/handleApiError';
import toast from 'react-hot-toast';
import { useAppContext } from '@/contexts/AppContext';

export const useDeleteChats = (
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>,
  onClose: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);

    const {
      handleCurrentChatTitle,
      handleCurrentChatId,
      handleMessages,
    } = useAppContext();

  const deleteAllChats = useCallback(async () => {
    try {
        setIsLoading(true);

      const response = await api.delete('/user/chats/delete-all');

      await mutate();

      handleCurrentChatId(null);
      handleCurrentChatTitle(null);
      handleMessages([]);
      
      toast.success(response.data.message);
      onClose()
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutate]);

  return {
    deleteAllChats, isLoading
  };
};