'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, X, Check } from 'lucide-react';

interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  url: string;
  isDefault?: boolean;
}

interface VideoSubtitlesProps {
  videoId: string;
  currentTime: number;
  className?: string;
}

export function VideoSubtitles({ videoId, className = '' }: VideoSubtitlesProps) {
  const [tracks, setTracks] = useState<SubtitleTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadLanguage, setUploadLanguage] = useState('pt-BR');

  // Carregar tracks salvos
  useEffect(() => {
    const savedTracks = localStorage.getItem(`video-subtitles-${videoId}`);
    if (savedTracks) {
      try {
        const parsedTracks = JSON.parse(savedTracks);
        setTracks(parsedTracks);
        const defaultTrack = parsedTracks.find((track: SubtitleTrack) => track.isDefault);
        if (defaultTrack) {
          setActiveTrack(defaultTrack.id);
        }
      } catch (error) {
        console.error('Erro ao carregar legendas:', error);
      }
    }
  }, [videoId]);

  // Salvar tracks
  const saveTracks = useCallback((tracksToSave: SubtitleTrack[]) => {
    localStorage.setItem(`video-subtitles-${videoId}`, JSON.stringify(tracksToSave));
  }, [videoId]);

  // Upload de arquivo de legenda
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/vtt') {
      setUploadFile(file);
    } else {
      alert('Por favor, selecione um arquivo .vtt válido');
    }
  }, []);

  // Adicionar track de legenda
  const addSubtitleTrack = useCallback(async () => {
    if (!uploadFile || !uploadLabel.trim()) return;

    setIsUploading(true);
    try {
      // Simular upload (em produção, enviaria para o servidor)
      const fileContent = await uploadFile.text();
      const blob = new Blob([fileContent], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);

      const newTrack: SubtitleTrack = {
        id: Date.now().toString(),
        label: uploadLabel.trim(),
        language: uploadLanguage,
        url,
        isDefault: tracks.length === 0,
      };

      const updatedTracks = [...tracks, newTrack];
      setTracks(updatedTracks);
      saveTracks(updatedTracks);

      if (newTrack.isDefault) {
        setActiveTrack(newTrack.id);
      }

      // Reset form
      setUploadFile(null);
      setUploadLabel('');
      setUploadLanguage('pt-BR');
      setShowUpload(false);
    } catch (error) {
      console.error('Erro ao adicionar legenda:', error);
      alert('Erro ao processar arquivo de legenda');
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, uploadLabel, uploadLanguage, tracks, saveTracks]);

  // Remover track
  const removeTrack = useCallback((trackId: string) => {
    const updatedTracks = tracks.filter(track => track.id !== trackId);
    setTracks(updatedTracks);
    saveTracks(updatedTracks);

    if (activeTrack === trackId) {
      setActiveTrack(updatedTracks.length > 0 ? updatedTracks[0].id : null);
    }
  }, [tracks, activeTrack, saveTracks]);

  // Ativar/desativar track
  const toggleTrack = useCallback((trackId: string) => {
    setActiveTrack(activeTrack === trackId ? null : trackId);
  }, [activeTrack]);

  // Definir como padrão
  const setAsDefault = useCallback((trackId: string) => {
    const updatedTracks = tracks.map(track => ({
      ...track,
      isDefault: track.id === trackId,
    }));
    setTracks(updatedTracks);
    saveTracks(updatedTracks);
  }, [tracks, saveTracks]);

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Legendas</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Upload de legenda */}
      {showUpload && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Arquivo de legenda (.vtt)
              </label>
              <input
                type="file"
                accept=".vtt"
                onChange={handleFileUpload}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Nome da legenda
              </label>
              <input
                type="text"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
                placeholder="Ex: Português, Inglês, etc."
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Idioma
              </label>
              <select
                value={uploadLanguage}
                onChange={(e) => setUploadLanguage(e.target.value)}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowUpload(false);
                  setUploadFile(null);
                  setUploadLabel('');
                }}
                className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addSubtitleTrack}
                disabled={!uploadFile || !uploadLabel.trim() || isUploading}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Adicionar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de legendas */}
      <div className="space-y-2">
        {tracks.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <div className="text-gray-400 mb-1">Nenhuma legenda disponível</div>
            <div className="text-gray-500 text-sm">
              Adicione arquivos .vtt para ativar legendas
            </div>
          </div>
        ) : (
          tracks.map((track) => (
            <div
              key={track.id}
              className={`p-3 rounded-lg border transition-colors ${
                activeTrack === track.id
                  ? 'bg-blue-900/30 border-blue-500'
                  : 'bg-gray-800 border-gray-600 hover:bg-gray-750'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTrack(track.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      activeTrack === track.id
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-400 hover:border-white'
                    }`}
                  >
                    {activeTrack === track.id && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <div>
                    <div className="text-white font-medium">{track.label}</div>
                    <div className="text-gray-400 text-sm">{track.language}</div>
                  </div>
                  {track.isDefault && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Padrão
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {!track.isDefault && (
                    <button
                      onClick={() => setAsDefault(track.id)}
                      className="text-gray-400 hover:text-green-400 transition-colors p-1"
                      title="Definir como padrão"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Remover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instruções */}
      {tracks.length > 0 && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="text-gray-300 text-sm">
            <strong>Dica:</strong> As legendas aparecerão automaticamente quando ativadas.
            Use o formato WebVTT (.vtt) para melhor compatibilidade.
          </div>
        </div>
      )}
    </div>
  );
}
