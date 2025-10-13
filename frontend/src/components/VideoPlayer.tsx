'use client';

import { Play, Pause, Volume2, VolumeX, RotateCcw, Settings, Bookmark, SkipBack } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onComplete?: () => void;
  onDuration?: (duration: number) => void;
  initialPosition?: number;
  autoSavePosition?: boolean;
}

export function VideoPlayer({ 
  src, 
  title, 
  className = '',
  onProgress,
  onComplete,
  onDuration,
  initialPosition = 0
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
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

  // Handle progress
  const handleProgress = useCallback((state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
      onProgress?.(state);
    }
  }, [seeking, onProgress]);

  // Handle duration
  const handleDuration = useCallback((duration: number) => {
    setDuration(duration);
    onDuration?.(duration);
  }, [onDuration]);

  // Handle complete
  const handleComplete = useCallback(() => {
    setIsPlaying(false);
    onComplete?.();
  }, [onComplete]);

  // Initialize position
  useEffect(() => {
    if (initialPosition > 0 && playerRef.current) {
      playerRef.current.seekTo(initialPosition);
      setPlayed(initialPosition / duration);
    }
  }, [initialPosition, duration]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeekChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value));
  }, []);

  const handleSeekMouseDown = useCallback(() => {
    setSeeking(true);
  }, []);

  const handleSeekMouseUp = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    const target = e.target as HTMLInputElement;
    playerRef.current?.seekTo(parseFloat(target.value));
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    setShowSettings(false);
  }, []);

  const restart = useCallback(() => {
    playerRef.current?.seekTo(0);
    setPlayed(0);
    setCurrentTime(0);
  }, []);

  const handleBookmark = useCallback(() => {
    if (currentTime > 0) {
      setBookmarks(prev => [...prev.filter(b => Math.abs(b - currentTime) > 5), currentTime]);
    }
  }, [currentTime]);

  const handleBookmarkSeek = useCallback((time: number) => {
    playerRef.current?.seekTo(time);
    setPlayed(time / duration);
  }, [duration]);

  const skipBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - 10);
    playerRef.current?.seekTo(newTime);
    setPlayed(newTime / duration);
  }, [currentTime, duration]);

  const skipForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 10);
    playerRef.current?.seekTo(newTime);
    setPlayed(newTime / duration);
  }, [currentTime, duration]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="aspect-video relative">
        <ReactPlayer
          ref={playerRef}
          url={src}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleComplete}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          config={{
            youtube: {
              playerVars: {
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              }
            },
            vimeo: {
              playerOptions: {
                controls: false,
                responsive: true,
              }
            }
          }}
        />
      
        {/* Overlay Controls */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <div className="flex items-center space-x-2">
              {/* Bookmarks */}
              {bookmarks.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Bookmark className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">{bookmarks.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors duration-200"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={played}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              />
              
              {/* Bookmarks on progress bar */}
              {bookmarks.map((bookmark, index) => (
                <div
                  key={index}
                  className="absolute top-0 w-2 h-2 bg-yellow-400 rounded-full transform -translate-y-1 cursor-pointer"
                  style={{ left: `${(bookmark / duration) * 100}%` }}
                  onClick={() => handleBookmarkSeek(bookmark)}
                  title={`Bookmark: ${formatTime(bookmark)}`}
                />
              ))}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Skip Backward */}
                <button
                  onClick={skipBackward}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Voltar 10s"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {/* Skip Forward */}
                <button
                  onClick={skipForward}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Avançar 10s"
                >
                  <SkipBack className="w-5 h-5 rotate-180" />
                </button>

                {/* Restart */}
                <button
                  onClick={restart}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Time Display */}
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Bookmark Button */}
                <button
                  onClick={handleBookmark}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Adicionar bookmark"
                >
                  <Bookmark className="w-5 h-5" />
                </button>

                {/* Settings */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-8 right-0 bg-black/90 rounded-lg p-2 min-w-[120px]">
                      <div className="text-white text-xs mb-2">Velocidade:</div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
                            playbackRate === rate ? 'bg-white/20' : 'text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length > 0 && (
        <div className="p-4 bg-gray-900">
          <h4 className="text-white font-semibold mb-2">Bookmarks</h4>
          <div className="space-y-1">
            {bookmarks
              .sort((a, b) => a - b)
              .map((bookmark, index) => (
                <button
                  key={index}
                  onClick={() => handleBookmarkSeek(bookmark)}
                  className="flex items-center justify-between w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  <span className="text-white text-sm">
                    Bookmark {index + 1}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatTime(bookmark)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
