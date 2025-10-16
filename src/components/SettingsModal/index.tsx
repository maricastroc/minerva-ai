import * as Dialog from '@radix-ui/react-dialog';
import {
  IconDatabase,
  IconSettings,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { ThemeSettings } from './ThemeSettings';
import { useState } from 'react';
import { UserSettings } from './UserSettings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems = [
  { icon: IconSettings, label: 'General', value: 'general' },
  { icon: IconUser, label: 'Profile', value: 'profile' },
  { icon: IconDatabase, label: 'Data', value: 'data' },
];

function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-2 rounded-lg hover:bg-outline-button-hover text-gray-25 flex items-center gap-2 transition-colors
        ${isActive && 'bg-outline-button-hover'}
      `}
    >
      <Icon size={18} />
      <span className="text-[15px]">{label}</span>
    </div>
  );
}

export function SettingsModal({ onClose, isOpen }: Props) {
  const [activeSetting, setActiveSetting] = useState<
    'general' | 'profile' | 'data'
  >('general');

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[990] bg-black/40 backdrop-blur-[2px]" />

        <Dialog.Content
          className="fixed z-[999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[90vw] min-h-[70vh] bg-modal rounded-3xl shadow-lg p-6 md:w-[750px]"
        >
          <div className="flex items-center justify-between w-full">
            <Dialog.Title className="text-lg font-semibold text-modal-text">
              Settings
            </Dialog.Title>
            <Dialog.Close className="cursor-pointer p-1 text-primary-text rounded-full hover:bg-white/15">
              <IconX size={20} />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-[1fr_3.5fr] gap-4 mt-6">
            {/* Sidebar */}
            <div className="ml-[-0.5rem] flex flex-col gap-2 w-[8rem]">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.value}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeSetting === item.value}
                  onClick={() =>
                    setActiveSetting(item.value as typeof activeSetting)
                  }
                />
              ))}
            </div>

            {/* Content */}
            <div className="mr-8">
              {activeSetting === 'general' && <ThemeSettings />}
              {activeSetting === 'profile' && <UserSettings />}
              {activeSetting === 'data' && (
                <div className="text-modal-text">Data settings here</div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
