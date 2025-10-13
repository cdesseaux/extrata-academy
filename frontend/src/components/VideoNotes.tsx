'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, Clock, Save } from 'lucide-react';

interface VideoNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface VideoNotesProps {
  videoId: string;
  currentTime: number;
  onSeekTo: (time: number) => void;
  className?: string;
}

export function VideoNotes({ videoId, currentTime, onSeekTo, className = '' }: VideoNotesProps) {
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Carregar anotações salvas
  useEffect(() => {
    const savedNotes = localStorage.getItem(`video-notes-${videoId}`);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: VideoNote) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Erro ao carregar anotações:', error);
      }
    }
  }, [videoId]);

  // Salvar anotações
  const saveNotes = useCallback((notesToSave: VideoNote[]) => {
    localStorage.setItem(`video-notes-${videoId}`, JSON.stringify(notesToSave));
  }, [videoId]);

  // Adicionar nova anotação
  const addNote = useCallback(() => {
    if (!newNoteContent.trim()) return;

    const newNote: VideoNote = {
      id: Date.now().toString(),
      timestamp: currentTime,
      content: newNoteContent.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedNotes = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setNewNoteContent('');
    setIsAddingNote(false);
  }, [newNoteContent, currentTime, notes, saveNotes]);

  // Editar anotação
  const startEditing = useCallback((note: VideoNote) => {
    setEditingNote(note.id);
    setEditingContent(note.content);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingNote || !editingContent.trim()) return;

    const updatedNotes = notes.map(note =>
      note.id === editingNote
        ? { ...note, content: editingContent.trim(), updatedAt: new Date() }
        : note
    );

    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setEditingNote(null);
    setEditingContent('');
  }, [editingNote, editingContent, notes, saveNotes]);

  const cancelEdit = useCallback(() => {
    setEditingNote(null);
    setEditingContent('');
  }, []);

  // Deletar anotação
  const deleteNote = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  // Formatar tempo
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Anotações</h3>
        <button
          onClick={() => setIsAddingNote(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Anotação</span>
        </button>
      </div>

      {/* Adicionar nova anotação */}
      {isAddingNote && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              {formatTime(currentTime)}
            </span>
          </div>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Digite sua anotação..."
            className="w-full bg-gray-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent('');
              }}
              className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={addNote}
              disabled={!newNoteContent.trim()}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de anotações */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">Nenhuma anotação ainda</div>
            <div className="text-gray-500 text-sm">
              Clique em &quot;Nova Anotação&quot; para adicionar uma
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => onSeekTo(note.timestamp)}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatTime(note.timestamp)}
                  </span>
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => startEditing(note)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingNote === note.id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={!editingContent.trim()}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-white text-sm leading-relaxed">
                  {note.content}
                </div>
              )}

              <div className="text-gray-500 text-xs mt-2">
                {note.updatedAt > note.createdAt ? 'Editado' : 'Criado'} em{' '}
                {note.updatedAt.toLocaleDateString('pt-BR')} às{' '}
                {note.updatedAt.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
