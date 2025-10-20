import { RefObject, useEffect, forwardRef } from 'react';

interface ChatTitleInputProps {
  value: string;
  setValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isMobile?: boolean;
}

export const ChatTitleInput = forwardRef<HTMLInputElement, ChatTitleInputProps>(({
  value,
  setValue,
  onSave,
  onCancel,
  isMobile,
}, ref) => {
  useEffect(() => {
    const inputRef = ref as RefObject<HTMLInputElement>;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [ref]);

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
      className={`flex-1 bg-transparent text-secondary-text focus:outline-none ${isMobile ? 'text-base' : 'text-sm'}`}
    />
  );
});

ChatTitleInput.displayName = 'ChatTitleInput';