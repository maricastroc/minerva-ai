import { useState, useEffect } from 'react';

export const useKeyboardOpen = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) return;

      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const keyboardOpen = visualViewport.height < window.innerHeight * 0.7;
        setIsKeyboardOpen(keyboardOpen);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return isKeyboardOpen;
};
