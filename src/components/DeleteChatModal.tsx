import { useDeleteChat } from '@/hooks/useDeleteChat';
import { ChatProps } from '@/types/chat';
import * as Dialog from '@radix-ui/react-dialog';
import { AxiosResponse } from 'axios';
import { KeyedMutator } from 'swr';

interface Props {
  chatId: string;
  isOpen: boolean;
  mutate: KeyedMutator<AxiosResponse<ChatProps[]>>;
  onClose: () => void;
}

export function DeleteChatModal({
  chatId,
  onClose,
  mutate,
  isOpen,
}: Props & { isOpen: boolean }) {
  const { isLoading, deleteChat } = useDeleteChat(chatId, mutate);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[990] bg-black/70 backdrop-blur-xs" />

        <Dialog.Content className="fixed z-[999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] bg-primary-gray600 rounded-3xl shadow-lg p-6 md:w-[370px]">
          <Dialog.Title className="text-lg font-semibold text-gray-200 mb-4">
            Delete chat?
          </Dialog.Title>

          <Dialog.Description className="flex flex-col w-full">
            <p className="text-sm font-medium text-gray-200">
              Are you sure you want to delete this chat? This action cannot be
              reversed!
            </p>

            <div className="mt-6 flex items-end justify-end w-full gap-2">
              <button
                disabled={isLoading}
                onClick={onClose}
                className="cursor-pointer font-semibold rounded-3xl p-2 px-4 flex items-center gap-2 transition-all duration-300 max-h-[60px] text-sm bg-transparent border border-primary-gray400 text-gray-100 hover:bg-white/10 capitalize justify-center disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                onClick={async () => {
                  await deleteChat();
                  onClose();
                }}
                className="cursor-pointer font-semibold rounded-3xl p-2 px-4 flex items-center gap-2 transition-all duration-300 max-h-[60px] text-sm bg-transparent border border-primary-red500 hover:bg-primary-red500/10 text-primary-red500 capitalize justify-center disabled:bg-gray-400 disabled:border-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
