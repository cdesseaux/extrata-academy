'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Maximize,
  Minimize,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff
} from 'lucide-react';

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  src: string;
  title?: string;
  pdfId: string;
  className?: string;
  onComplete?: () => void;
  initialPage?: number;
  initialZoom?: number;
}

export function PDFViewer({ 
  src, 
  title, 
  pdfId, 
  className = '',
  onComplete,
  initialPage = 1,
  initialZoom = 1.0
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-hide controls
  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    hideControls();
  }, [hideControls]);

  // Carregar bookmarks salvos
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`pdf-bookmarks-${pdfId}`);
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Erro ao carregar bookmarks:', error);
      }
    }

    const savedPage = localStorage.getItem(`pdf-page-${pdfId}`);
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }

    const savedZoom = localStorage.getItem(`pdf-zoom-${pdfId}`);
    if (savedZoom) {
      setZoom(parseFloat(savedZoom));
    }
  }, [pdfId]);

  // Salvar estado
  const saveState = useCallback(() => {
    localStorage.setItem(`pdf-page-${pdfId}`, currentPage.toString());
    localStorage.setItem(`pdf-zoom-${pdfId}`, zoom.toString());
    localStorage.setItem(`pdf-bookmarks-${pdfId}`, JSON.stringify(bookmarks));
  }, [pdfId, currentPage, zoom, bookmarks]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Handlers
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    setError('Erro ao carregar PDF: ' + error.message);
    setIsLoading(false);
  }, []);

  const onPageLoadSuccess = useCallback(() => {
    // Página carregada com sucesso
  }, []);

  const onPageLoadError = useCallback((error: Error) => {
    setError('Erro ao carregar página: ' + error.message);
  }, []);

  // Navegação
  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(numPages, page)));
  }, [numPages]);

  // Zoom
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(3.0, prev + 0.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.5, prev - 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  // Rotação
  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Download
  const downloadPDF = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'documento.pdf';
    link.click();
  }, [src, title]);

  // Bookmarks
  const toggleBookmark = useCallback(() => {
    setBookmarks(prev => {
      if (prev.includes(currentPage)) {
        return prev.filter(page => page !== currentPage);
      } else {
        return [...prev, currentPage].sort((a, b) => a - b);
      }
    });
  }, [currentPage]);

  const goToBookmark = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Busca
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Implementar busca no PDF
    console.log('Buscar:', searchText);
  }, [searchText]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'r':
          e.preventDefault();
          rotate();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'b':
          e.preventDefault();
          toggleBookmark();
          break;
        case '/':
          e.preventDefault();
          setShowSearch(true);
          break;
        case 'Escape':
          setShowSearch(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousPage, goToNextPage, zoomIn, zoomOut, resetZoom, rotate, toggleFullscreen, toggleBookmark]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-red-600 mb-4">
          <EyeOff className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Erro ao carregar PDF</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg truncate">
            {title || 'Documento PDF'}
          </h2>
          <div className="flex items-center space-x-2">
            {bookmarks.length > 0 && (
              <div className="flex items-center space-x-1">
                <BookmarkCheck className="w-4 h-4 text-white" />
                <span className="text-white text-sm">{bookmarks.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando PDF...</p>
              </div>
            ) : (
              <div className="shadow-lg">
                <Document
                  file={src}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Carregando...</p>
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    scale={zoom}
                    rotate={rotation}
                    onLoadSuccess={onPageLoadSuccess}
                    onLoadError={onPageLoadError}
                    className="shadow-lg"
                  />
                </Document>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Bookmarks */}
        {showBookmarks && (
          <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Bookmarks</h3>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {bookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nenhum bookmark</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => goToBookmark(page)}
                      className="w-full text-left p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      <div className="text-white text-sm">
                        Página {page}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={1}
                max={numPages}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-16 bg-gray-700 text-white text-center px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-white text-sm">/ {numPages}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded transition-colors ${
                bookmarks.includes(currentPage)
                  ? 'bg-yellow-600 text-white'
                  : 'text-white hover:bg-gray-700'
              }`}
              title="Adicionar/Remover Bookmark (B)"
            >
              <Bookmark className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="text-white hover:bg-gray-700 p-2 rounded transition-colors"
              title="Mostrar Bookmarks"
            >
              <BookmarkCheck className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Zoom */}
            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                className="text-white hover:text-gray-300 transition-colors"
                title="Diminuir Zoom (-)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white text-sm min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="text-white hover:text-gray-300 transition-colors"
                title="Aumentar Zoom (+)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={resetZoom}
                className="text-white hover:text-gray-300 transition-colors text-sm px-2 py-1"
                title="Reset Zoom (0)"
              >
                100%
              </button>
            </div>

            {/* Rotate */}
            <button
              onClick={rotate}
              className="text-white hover:text-gray-300 transition-colors"
              title="Rotacionar (R)"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-white hover:text-gray-300 transition-colors"
              title="Buscar (/)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Download */}
            <button
              onClick={downloadPDF}
              className="text-white hover:text-gray-300 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
              title="Tela Cheia (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-4 shadow-lg z-20">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar no PDF..."
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </form>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
        <div className="space-y-1">
          <div>← → Navegar páginas</div>
          <div>+ - Zoom</div>
          <div>0 Reset zoom</div>
          <div>R Rotacionar</div>
          <div>F Tela cheia</div>
          <div>B Bookmark</div>
          <div>/ Buscar</div>
        </div>
      </div>
    </div>
  );
}


