import { useAppContext } from '@/contexts/AppContext';
import { IconDeviceLaptop, IconMoon, IconSun } from '@tabler/icons-react';

const themes = [
  { label: 'Light', icon: IconSun, value: 'light' as const },
  { label: 'Dark', icon: IconMoon, value: 'dark' as const },
  { label: 'System', icon: IconDeviceLaptop, value: 'system' as const },
];

export const ThemeSettings = () => {
  const { handleIsDarkTheme } = useAppContext();

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      document.documentElement.setAttribute(
        'data-theme',
        prefersDark ? 'dark' : 'light'
      );
      handleIsDarkTheme(prefersDark);
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      handleIsDarkTheme(theme === 'dark');
    }
  };

  return (
    <div>
      <p className="font-medium mb-3 text-[15px]">Theme</p>

      <div className="flex items-center w-full gap-3">
        {themes.map(({ label, icon: Icon, value }) => (
          <button
            key={label}
            onClick={() => setTheme(value)}
            className="flex gap-1 duration-100 cursor-pointer transition-all 
              text-gray-50 items-center justify-center 
              w-full flex-col border border-gray-400 
              p-4 rounded-lg hover:bg-gray-500"
          >
            <Icon size={20} />
            <p className="text-sm font-medium">{label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
