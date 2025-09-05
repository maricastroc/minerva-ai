'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTTS } from '@/hooks/useTTS';

interface AudioContextType {
  isSpeaking: boolean;
  currentSpeakingText: string | null;
  speak: (text: string) => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(
    null
  );

  const handleSpeechStart = useCallback(() => {
    setIsSpeaking(true);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setIsSpeaking(false);
    setCurrentSpeakingText(null);
  }, []);

  const handleSpeechError = useCallback(() => {
    setIsSpeaking(false);
    setCurrentSpeakingText(null);
  }, []);

  const { speak: ttsSpeak, stop: ttsStop } = useTTS({
    onStart: handleSpeechStart,
    onEnd: handleSpeechEnd,
    onError: handleSpeechError,
  });

  const speak = useCallback(
    (text: string) => {
      setCurrentSpeakingText(text);
      ttsSpeak(text);
    },
    [ttsSpeak]
  );

  const stop = useCallback(() => {
    ttsStop();
    setIsSpeaking(false);
    setCurrentSpeakingText(null);
  }, [ttsStop]);

  return (
    <AudioContext.Provider
      value={{ isSpeaking, currentSpeakingText, speak, stop }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);

  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
