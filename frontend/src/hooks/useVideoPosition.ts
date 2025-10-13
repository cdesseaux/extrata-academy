'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseVideoPositionOptions {
  videoId: string;
  autoSave?: boolean;
  saveInterval?: number; // em segundos
}

export function useVideoPosition({ 
  videoId, 
  autoSave = true, 
  saveInterval = 5 
}: UseVideoPositionOptions) {
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar posição salva
  useEffect(() => {
    const savedPosition = localStorage.getItem(`video-position-${videoId}`);
    if (savedPosition) {
      setPosition(parseFloat(savedPosition));
    }
    setIsLoading(false);
  }, [videoId]);

  // Salvar posição
  const savePosition = useCallback((newPosition: number) => {
    setPosition(newPosition);
    localStorage.setItem(`video-position-${videoId}`, newPosition.toString());
  }, [videoId]);

  // Auto-save com interval
  const handleProgress = useCallback((progress: { playedSeconds: number }) => {
    if (autoSave && progress.playedSeconds > 0) {
      // Salva apenas se passou do intervalo definido
      const shouldSave = Math.floor(progress.playedSeconds) % saveInterval === 0;
      if (shouldSave) {
        savePosition(progress.playedSeconds);
      }
    }
  }, [autoSave, saveInterval, savePosition]);

  // Limpar posição salva
  const clearPosition = useCallback(() => {
    setPosition(0);
    localStorage.removeItem(`video-position-${videoId}`);
  }, [videoId]);

  // Marcar como concluído
  const markAsCompleted = useCallback(() => {
    setPosition(0);
    localStorage.setItem(`video-completed-${videoId}`, 'true');
    localStorage.removeItem(`video-position-${videoId}`);
  }, [videoId]);

  // Verificar se foi concluído
  const isCompleted = useCallback(() => {
    return localStorage.getItem(`video-completed-${videoId}`) === 'true';
  }, [videoId]);

  return {
    position,
    isLoading,
    savePosition,
    handleProgress,
    clearPosition,
    markAsCompleted,
    isCompleted: isCompleted(),
  };
}


