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
        <Dialog.Overlay className="fixed inset-0 z-[990] bg-black/40 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed z-[999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] min-h-[70vh] bg-modal rounded-3xl shadow-lg p-6 md:w-[750px]">
          <div className="flex items-center justify-between w-full">
            <Dialog.Title className="text-lg font-semibold text-modal-text">
              Settings
            </Dialog.Title>

            <Dialog.Close className="cursor-pointer p-1 rounded-full hover:bg-white/15">
              <IconX size={22} />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-[1fr_3.5fr] gap-4 mt-6">
            <div className="ml-[-0.5rem] flex flex-col gap-2 w-[8rem]">
              <div className="cursor-pointer p-2 rounded-lg flex items-center gap-2 hover:bg-dropdown-hover">
                <IconSettings className="text-gray-25" size={18} />
                <div className="text-gray-25 text-[15px]">General</div>
              </div>

              <div className="cursor-pointer p-2 rounded-lg flex items-center gap-2 hover:bg-dropdown-hover">
                <IconUser className="text-gray-25" size={18} />
                <div className="text-gray-25 text-[15px]">Profile</div>
              </div>

              <div className="cursor-pointer p-2 rounded-lg flex items-center gap-2 hover:bg-dropdown-hover">
                <IconDatabase className="text-gray-25" size={18} />
                <div className="text-gray-25 text-[15px]">Data</div>
              </div>
            </div>
            <div className="mr-8">
              <ThemeSettings />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
