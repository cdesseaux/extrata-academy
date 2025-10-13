'use client';

import React, { useState, useCallback } from 'react';
import { PDFViewer } from './PDFViewer';
import { PDFNotes } from './PDFNotes';
import { usePDFPosition } from '../hooks/usePDFPosition';
import { FileText, BookOpen, Settings, X, Clock, CheckCircle } from 'lucide-react';

interface AdvancedPDFViewerProps {
  src: string;
  title?: string;
  pdfId: string;
  className?: string;
  onComplete?: () => void;
  initialPage?: number;
  initialZoom?: number;
}

export function AdvancedPDFViewer({ 
  src, 
  title, 
  pdfId, 
  className = '',
  onComplete,
  initialPage = 1,
  initialZoom = 1.0
}: AdvancedPDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'info'>('notes');

  const { 
    currentPage: savedPage,
    zoom: savedZoom,
    bookmarks,
    isLoading,
    updatePage,
    updateZoom,
    updateRotation,
    toggleBookmark,
    markAsCompleted,
    isCompleted,
    completionDate,
    totalReadingTime,
    startReading,
    endReading
  } = usePDFPosition({ 
    pdfId, 
    autoSave: true, 
    saveInterval: 10 
  });

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updatePage(page);
  }, [updatePage]);

  // Handle zoom change
  const handleZoomChange = useCallback((zoom: number) => {
    updateZoom(zoom);
  }, [updateZoom]);

  // Handle rotation change
  const handleRotationChange = useCallback((rotation: number) => {
    updateRotation(rotation);
  }, [updateRotation]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((page: number) => {
    toggleBookmark(page);
  }, [toggleBookmark]);

  // Handle PDF complete
  const handlePDFComplete = useCallback(() => {
    markAsCompleted();
    endReading();
    onComplete?.();
  }, [markAsCompleted, endReading, onComplete]);

  // Handle go to page
  const handleGoToPage = useCallback((page: number) => {
    setCurrentPage(page);
    updatePage(page);
  }, [updatePage]);

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  // Start reading session
  React.useEffect(() => {
    startReading();
    return () => {
      endReading();
    };
  }, [startReading, endReading]);

  if (isLoading) {
    return (
      <div className={`bg-gray-900 rounded-lg p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <div className="flex">
        {/* Main PDF Area */}
        <div className={`transition-all duration-300 ${showSidebar ? 'flex-1' : 'w-full'}`}>
          <PDFViewer
            src={src}
            title={title}
            pdfId={pdfId}
            initialPage={savedPage || initialPage}
            initialZoom={savedZoom || initialZoom}
            onComplete={handlePDFComplete}
            className="w-full h-full"
          />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">
                  {activeTab === 'notes' ? 'Anotações' : 'Informações'}
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex mt-3 space-x-1">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Anotações</span>
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'info'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Info</span>
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'notes' ? (
                <PDFNotes
                  pdfId={pdfId}
                  currentPage={currentPage}
                  onGoToPage={handleGoToPage}
                  className="h-full"
                />
              ) : (
                <div className="p-4 space-y-4">
                  {/* Status */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        )}
                        <span className="text-white text-sm">
                          {isCompleted ? 'Concluído' : 'Em progresso'}
                        </span>
                      </div>
                      {completionDate && (
                        <div className="text-gray-400 text-sm">
                          Concluído em: {completionDate.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Estatísticas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Página atual:</span>
                        <span className="text-white text-sm">{currentPage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Bookmarks:</span>
                        <span className="text-white text-sm">{bookmarks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Tempo de leitura:</span>
                        <span className="text-white text-sm">{formatTime(totalReadingTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bookmarks */}
                  {bookmarks.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Bookmarks</h4>
                      <div className="space-y-1">
                        {bookmarks.map((page, index) => (
                          <button
                            key={index}
                            onClick={() => handleGoToPage(page)}
                            className="w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                          >
                            <span className="text-white text-sm">
                              Página {page}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Ações</h4>
                    <div className="space-y-2">
                      {!isCompleted && (
                        <button
                          onClick={handlePDFComplete}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors"
                        >
                          Marcar como Concluído
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // Implementar compartilhamento
                          console.log('Compartilhar PDF');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
                      >
                        Compartilhar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {!showSidebar && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowSidebar(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Abrir painel lateral"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      {isCompleted && (
        <div className="absolute bottom-4 left-4 bg-green-600 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Documento concluído</span>
          </div>
        </div>
      )}
    </div>
  );
}


