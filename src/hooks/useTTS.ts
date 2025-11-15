import { useState, useCallback } from 'react';
import { franc } from 'franc';
import { handleApiError } from '@/utils/handleApiError';

interface useTTSProps {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function useTTS({ onStart, onEnd, onError }: useTTSProps = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getBrowserLangCode = (francCode: string): string => {
    const langMap: { [key: string]: string } = {
      por: 'pt-BR',
      eng: 'en-US',
      spa: 'es-ES',
      fra: 'fr-FR',
      ita: 'it-IT',
      deu: 'de-DE',
      rus: 'ru-RU',
      jpn: 'ja-JP',
      kor: 'ko-KR',
      zho: 'zh-CN',
      ara: 'ar-SA',
      hin: 'hi-IN',
    };

    return langMap[francCode] || 'en-US';
  };

  const speak = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window)) {
        alert('Seu navegador não suporta síntese de voz');
        return;
      }

      let langCode = 'en-US';

      if (text.length > 10) {
        try {
          const francCode = franc(text);
          langCode = getBrowserLangCode(francCode);
        } catch (error) {
          handleApiError(error);
        }
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        onError?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [onStart, onEnd, onError]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    onEnd?.();
  }, [onEnd]);

  return { speak, stop, isSpeaking };
}
