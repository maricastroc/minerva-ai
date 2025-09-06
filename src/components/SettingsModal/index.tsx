import * as Dialog from '@radix-ui/react-dialog';
import {
  IconDatabase,
  IconSettings,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { ThemeSettings } from './ThemeSettings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ onClose, isOpen }: Props) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[990] bg-black/70 backdrop-blur-xs" />

        <Dialog.Content className="fixed z-[999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] min-h-[60vh] bg-gray-600 rounded-3xl shadow-lg p-6 md:w-[700px]">
          <div className="flex items-center justify-between w-full">
            <Dialog.Title className="text-lg font-semibold text-gray-25">
              Settings
            </Dialog.Title>

            <Dialog.Close className="cursor-pointer p-1 rounded-full hover:bg-white/15">
              <IconX size={22} />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-[1fr_3fr] gap-4 mt-6">
            <div className="ml-[-0.5rem] flex flex-col gap-2 w-[8rem]">
              <div className="cursor-pointer p-2 rounded-lg flex items-center gap-2 hover:bg-gray-550">
                <IconSettings className="text-gray-25" size={20} />
                <div className="text-gray-25 text-xm">General</div>
              </div>

              <div className="cursor-pointer p-2 rounded-lg flex items-center gap-2 hover:bg-gray-550">
                <IconUser className="text-gray-25" size={20} />
                <div className="text-gray-25">Profile</div>
              </div>

              <div className="cursor-pointer p-2 rounded-lg flex items-center gap-2 hover:bg-gray-550">
                <IconDatabase className="text-gray-25" size={20} />
                <div className="text-gray-25">Data</div>
              </div>
            </div>
            <div className="mr-5">
              <ThemeSettings />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
