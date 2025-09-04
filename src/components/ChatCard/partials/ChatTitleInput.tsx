import { RefObject, useEffect } from 'react';

interface ChatTitleInputProps {
  value: string;
  setValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isMobile?: boolean;
  ref: RefObject<HTMLInputElement | null>;
}

export const ChatTitleInput = ({
  value,
  setValue,
  onSave,
  onCancel,
  isMobile,
  ref,
}: ChatTitleInputProps) => {
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSave();
    else if (e.key === 'Escape') onCancel();
  };

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      spellCheck={false}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyPress}
      className={`flex-1 bg-transparent text-white focus:outline-none ${isMobile ? 'text-base' : 'text-sm'}`}
    />
  );
};
