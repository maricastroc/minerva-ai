import { useAppContext } from '@/contexts/AppContext';
import { IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';

const themes = [
  { label: 'Light', icon: IconSun, value: 'light' as const },
  { label: 'Dark', icon: IconMoon, value: 'dark' as const },
  { label: 'System', icon: IconDeviceLaptop, value: 'system' as const },
];

export const ThemeSettings = () => {
  const { currentTheme, handleSetTheme } = useAppContext();

  return (
    <div>
      <p className="font-medium mb-4 text-[15px] text-primary-text">Theme</p>

      <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:items-center w-full">
        {themes.map(({ label, icon: Icon, value }) => {
          const isActive = currentTheme === value;
          // System ocupa 2 colunas em mobile (linha inteira)
          const isSystem = value === 'system';

          return (
            <button
              key={label}
              onClick={() => handleSetTheme(value)}
              className={`
                w-full md:flex-grow flex gap-2 duration-100 cursor-pointer transition-all
                text-primary-text items-center justify-center 
                flex-col border border-outline-button-border 
                p-4 py-5 rounded-lg hover:bg-outline-button-hover
                ${isActive ? 'bg-outline-button-hover' : ''}
                ${isSystem ? 'col-span-2 md:col-span-1' : ''}
              `}
            >
              <Icon size={20} />
              <p className="text-sm font-medium">{label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};