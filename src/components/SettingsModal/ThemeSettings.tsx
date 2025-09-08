import { useAppContext } from '@/contexts/AppContext';
import { IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';

const themes = [
  { label: 'Light', icon: IconSun, value: 'light' as const },
  { label: 'Dark', icon: IconMoon, value: 'dark' as const },
  { label: 'System', icon: IconDeviceLaptop, value: 'system' as const },
];

export const ThemeSettings = () => {
  const { currentTheme, handleSetTheme } = useAppContext();
  console.log(currentTheme);
  return (
    <div>
      <p className="font-medium mb-3 text-[15px]">Theme</p>

      <div className="flex items-center w-full gap-3">
        {themes.map(({ label, icon: Icon, value }) => {
          // botão ativo se currentTheme bate com o value
          const isActive = currentTheme === value;

          return (
            <button
              key={label}
              onClick={() => handleSetTheme(value)}
              className={`
        flex gap-1 duration-100 cursor-pointer transition-all
        text-gray-50 items-center justify-center 
        w-full flex-col border border-gray-400 
        p-4 rounded-lg hover:bg-gray-500
        ${isActive ? 'bg-gray-500' : ''}
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
