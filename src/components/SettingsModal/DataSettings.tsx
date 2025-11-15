import { useDeleteChats } from '@/hooks/useDeleteChats';
import { ChatProps } from '@/types/chat';
import { IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { KeyedMutator } from 'swr';
import { DeleteButton } from '../DeleteButton';

interface DataSettingProps {
  mutateChats: KeyedMutator<AxiosResponse<ChatProps[]>>;
  onClose: () => void;
}

export const DataSettings = ({ mutateChats, onClose }: DataSettingProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const { deleteAllChats, isLoading } = useDeleteChats(mutateChats, onClose)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2 text-[15px] text-primary-text">Chat Data</h3>
        <p className="text-sm text-primary-text mb-4">
          Manage your conversation history and chat data
        </p>
        
        <div className="border border-outline-button-border rounded-lg p-4">
          {!isConfirming ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-primary-text">Delete All Chats</p>
                <p className="text-sm text-primary-text mt-1">
                  Permanently remove all your conversations
                </p>
              </div>
              <DeleteButton
                type='button'
                disabled={isLoading}
                onClick={() => setIsConfirming(true)}
              >
                <IconTrash size={18} />
                Delete All
              </DeleteButton>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-100">
                <IconAlertTriangle size={20} />
                <p className="font-medium">Are you sure?</p>
              </div>
              <p className="text-sm text-primary-text">
                This action cannot be undone. All your chat history will be permanently deleted.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <DeleteButton
                  onClick={() => deleteAllChats()}
                  disabled={isLoading}
                >
                  Yes, Delete Everything
                </DeleteButton>
                <button
                  type='button'
                  onClick={() => setIsConfirming(false)}
                  disabled={isLoading}
                  className="cursor-pointer font-semibold rounded-3xl p-2 px-4 flex items-center gap-2 transition-all duration-300 max-h-[60px] text-sm bg-transparent border border-cancel text-primary-text hover:bg-cancel-hover capitalize justify-center disabled:bg-disabled disabled:text-text-disabled disabled:cursor-not-allowed"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};