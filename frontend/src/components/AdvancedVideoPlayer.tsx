'use client';

import React, { useState, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { VideoNotes } from './VideoNotes';
import { VideoSubtitles } from './VideoSubtitles';
import { useVideoPosition } from '../hooks/useVideoPosition';
import { BookOpen, FileText, Settings, X } from 'lucide-react';

interface AdvancedVideoPlayerProps {
  src: string;
  title?: string;
  videoId: string;
  className?: string;
  onComplete?: () => void;
}

export function AdvancedVideoPlayer({ 
  src, 
  title, 
  videoId, 
  className = '',
  onComplete 
}: AdvancedVideoPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [, setDuration] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'subtitles'>('notes');

  const { 
    position, 
    isLoading, 
    handleProgress, 
    markAsCompleted 
  } = useVideoPosition({ 
    videoId, 
    autoSave: true, 
    saveInterval: 5 
  });

  // Handle progress from video player
  const onProgress = useCallback((progress: { played: number; playedSeconds: number }) => {
    setCurrentTime(progress.playedSeconds);
    handleProgress(progress);
  }, [handleProgress]);

  // Handle duration
  const onDuration = useCallback((duration: number) => {
    setDuration(duration);
  }, []);

  // Handle video complete
  const onVideoComplete = useCallback(() => {
    markAsCompleted();
    onComplete?.();
  }, [markAsCompleted, onComplete]);

  // Handle seek to specific time
  const handleSeekTo = useCallback(() => {
    // This would be handled by the VideoPlayer component
    // We'll pass this as a ref or callback
  }, []);

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
        {/* Main Video Area */}
        <div className={`transition-all duration-300 ${showSidebar ? 'flex-1' : 'w-full'}`}>
          <VideoPlayer
            src={src}
            title={title}
            initialPosition={position}
            onProgress={onProgress}
            onDuration={onDuration}
            onComplete={onVideoComplete}
            className="w-full"
          />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">
                  {activeTab === 'notes' ? 'Anotações' : 'Legendas'}
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
                  onClick={() => setActiveTab('subtitles')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'subtitles'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Legendas</span>
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'notes' ? (
                <VideoNotes
                  videoId={videoId}
                  currentTime={currentTime}
                  onSeekTo={handleSeekTo}
                  className="h-full"
                />
              ) : (
                <VideoSubtitles
                  videoId={videoId}
                  currentTime={currentTime}
                  className="h-full"
                />
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
      {position > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Posição salva: {Math.floor(position / 60)}:{(position % 60).toFixed(0).padStart(2, '0')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
