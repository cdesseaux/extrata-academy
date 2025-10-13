'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsePDFPositionOptions {
  pdfId: string;
  autoSave?: boolean;
  saveInterval?: number; // em segundos
}

export function usePDFPosition({ 
  pdfId, 
  autoSave = true, 
  saveInterval = 10 
}: UsePDFPositionOptions) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Carregar estado salvo
  useEffect(() => {
    const savedPage = localStorage.getItem(`pdf-page-${pdfId}`);
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }

    const savedZoom = localStorage.getItem(`pdf-zoom-${pdfId}`);
    if (savedZoom) {
      setZoom(parseFloat(savedZoom));
    }

    const savedRotation = localStorage.getItem(`pdf-rotation-${pdfId}`);
    if (savedRotation) {
      setRotation(parseInt(savedRotation));
    }

    const savedBookmarks = localStorage.getItem(`pdf-bookmarks-${pdfId}`);
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Erro ao carregar bookmarks:', error);
      }
    }

    setIsLoading(false);
  }, [pdfId]);

  // Salvar estado
  const saveState = useCallback(() => {
    localStorage.setItem(`pdf-page-${pdfId}`, currentPage.toString());
    localStorage.setItem(`pdf-zoom-${pdfId}`, zoom.toString());
    localStorage.setItem(`pdf-rotation-${pdfId}`, rotation.toString());
    localStorage.setItem(`pdf-bookmarks-${pdfId}`, JSON.stringify(bookmarks));
  }, [pdfId, currentPage, zoom, rotation, bookmarks]);

  // Auto-save com interval
  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
    if (autoSave) {
      saveState();
    }
  }, [autoSave, saveState]);

  // Atualizar página
  const updatePage = useCallback((page: number) => {
    setCurrentPage(page);
    handleActivity();
  }, [handleActivity]);

  // Atualizar zoom
  const updateZoom = useCallback((newZoom: number) => {
    setZoom(newZoom);
    handleActivity();
  }, [handleActivity]);

  // Atualizar rotação
  const updateRotation = useCallback((newRotation: number) => {
    setRotation(newRotation);
    handleActivity();
  }, [handleActivity]);

  // Adicionar/remover bookmark
  const toggleBookmark = useCallback((page: number) => {
    setBookmarks(prev => {
      const newBookmarks = prev.includes(page)
        ? prev.filter(p => p !== page)
        : [...prev, page].sort((a, b) => a - b);
      
      handleActivity();
      return newBookmarks;
    });
  }, [handleActivity]);

  // Limpar estado
  const clearState = useCallback(() => {
    setCurrentPage(1);
    setZoom(1.0);
    setRotation(0);
    setBookmarks([]);
    localStorage.removeItem(`pdf-page-${pdfId}`);
    localStorage.removeItem(`pdf-zoom-${pdfId}`);
    localStorage.removeItem(`pdf-rotation-${pdfId}`);
    localStorage.removeItem(`pdf-bookmarks-${pdfId}`);
  }, [pdfId]);

  // Marcar como concluído
  const markAsCompleted = useCallback(() => {
    localStorage.setItem(`pdf-completed-${pdfId}`, 'true');
    localStorage.setItem(`pdf-completion-date-${pdfId}`, new Date().toISOString());
  }, [pdfId]);

  // Verificar se foi concluído
  const isCompleted = useCallback(() => {
    return localStorage.getItem(`pdf-completed-${pdfId}`) === 'true';
  }, [pdfId]);

  // Obter data de conclusão
  const getCompletionDate = useCallback(() => {
    const dateStr = localStorage.getItem(`pdf-completion-date-${pdfId}`);
    return dateStr ? new Date(dateStr) : null;
  }, [pdfId]);

  // Obter tempo de leitura estimado
  const getReadingTime = useCallback(() => {
    const startTime = localStorage.getItem(`pdf-start-time-${pdfId}`);
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      return Math.floor((now - start) / 1000); // em segundos
    }
    return 0;
  }, [pdfId]);

  // Iniciar sessão de leitura
  const startReading = useCallback(() => {
    localStorage.setItem(`pdf-start-time-${pdfId}`, new Date().toISOString());
  }, [pdfId]);

  // Finalizar sessão de leitura
  const endReading = useCallback(() => {
    const readingTime = getReadingTime();
    const totalTime = localStorage.getItem(`pdf-total-time-${pdfId}`);
    const newTotalTime = (parseInt(totalTime || '0') + readingTime);
    localStorage.setItem(`pdf-total-time-${pdfId}`, newTotalTime.toString());
    localStorage.removeItem(`pdf-start-time-${pdfId}`);
    return readingTime;
  }, [pdfId, getReadingTime]);

  // Obter tempo total de leitura
  const getTotalReadingTime = useCallback(() => {
    const totalTime = localStorage.getItem(`pdf-total-time-${pdfId}`);
    return parseInt(totalTime || '0');
  }, [pdfId]);

  // Auto-save periódico
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      // Salvar apenas se houve atividade recente
      if (timeSinceLastActivity < saveInterval * 1000) {
        saveState();
      }
    }, saveInterval * 1000);

    return () => clearInterval(interval);
  }, [autoSave, saveInterval, lastActivity, saveState]);

  return {
    // Estado atual
    currentPage,
    zoom,
    rotation,
    bookmarks,
    isLoading,
    
    // Ações
    updatePage,
    updateZoom,
    updateRotation,
    toggleBookmark,
    clearState,
    markAsCompleted,
    
    // Status
    isCompleted: isCompleted(),
    completionDate: getCompletionDate(),
    readingTime: getReadingTime(),
    totalReadingTime: getTotalReadingTime(),
    
    // Sessão
    startReading,
    endReading,
  };
}


