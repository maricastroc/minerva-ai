/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { AxiosResponse } from 'axios';
import { ChatProps } from '@/types/chat';

export const useUpdateChatTitle = (
  mutate: KeyedMutator<AxiosResponse<ChatProps[], any>>,
  setCurrentChatTitle: (value: string) => void,
  currentChatId: string | null
) => {
  const [loading, setLoading] = useState(false);

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/chats/${chatId}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error('Failed to update title');

      const data = await response.json();
      mutate();

      if (currentChatId === chatId) setCurrentChatTitle(newTitle);

      return data;
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { updateChatTitle, loading };
};
