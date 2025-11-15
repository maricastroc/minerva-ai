import { useState, useCallback, RefObject, useEffect } from 'react';

type DropdownPosition = 'top' | 'bottom';

interface UseDropdownPositionProps {
  dropdownRef: RefObject<HTMLElement | null>;
  dropdownHeight?: number;
  safeMargin?: number;
  isOpen?: boolean;
}

export const useDropdownPosition = ({
  dropdownRef,
  dropdownHeight = 120,
  safeMargin = 20,
  isOpen = false
}: UseDropdownPositionProps) => {
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>('bottom');

  const calculatePosition = useCallback(() => {
    if (!dropdownRef.current) return 'bottom';

    const triggerRect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    const spaceBelow = viewportHeight - triggerRect.bottom - safeMargin;
    const spaceAbove = triggerRect.top - safeMargin;
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      return 'top';
    }
    return 'bottom';
  }, [dropdownRef, dropdownHeight, safeMargin]);

  const updatePosition = useCallback(() => {
    const position = calculatePosition();
    setDropdownPosition(position);
  }, [calculatePosition]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      const handleResize = () => {
        updatePosition();
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen, updatePosition]);

  return {
    dropdownPosition,
    updatePosition
  };
};