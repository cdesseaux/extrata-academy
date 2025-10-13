'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, FileText, Save, X } from 'lucide-react';

interface PDFNote {
  id: string;
  page: number;
  content: string;
  position?: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

interface PDFNotesProps {
  pdfId: string;
  currentPage: number;
  onGoToPage: (page: number) => void;
  className?: string;
}

export function PDFNotes({ pdfId, currentPage, onGoToPage, className = '' }: PDFNotesProps) {
  const [notes, setNotes] = useState<PDFNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Carregar anotações salvas
  useEffect(() => {
    const savedNotes = localStorage.getItem(`pdf-notes-${pdfId}`);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: PDFNote) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Erro ao carregar anotações:', error);
      }
    }
  }, [pdfId]);

  // Salvar anotações
  const saveNotes = useCallback((notesToSave: PDFNote[]) => {
    localStorage.setItem(`pdf-notes-${pdfId}`, JSON.stringify(notesToSave));
  }, [pdfId]);

  // Adicionar nova anotação
  const addNote = useCallback(() => {
    if (!newNoteContent.trim()) return;

    const newNote: PDFNote = {
      id: Date.now().toString(),
      page: currentPage,
      content: newNoteContent.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedNotes = [...notes, newNote].sort((a, b) => a.page - b.page || a.createdAt.getTime() - b.createdAt.getTime());
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setNewNoteContent('');
    setIsAddingNote(false);
  }, [newNoteContent, currentPage, notes, saveNotes]);

  // Editar anotação
  const startEditing = useCallback((note: PDFNote) => {
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

  // Filtrar anotações por página
  const currentPageNotes = notes.filter(note => note.page === currentPage);
  const otherNotes = notes.filter(note => note.page !== currentPage);

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
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Página {currentPage}
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

      {/* Anotações da página atual */}
      {currentPageNotes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Página {currentPage}</h4>
          <div className="space-y-3">
            {currentPageNotes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
              >
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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">
                          Página {note.page}
                        </span>
                      </div>
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
                    <div className="text-white text-sm leading-relaxed">
                      {note.content}
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      {note.updatedAt > note.createdAt ? 'Editado' : 'Criado'} em{' '}
                      {note.updatedAt.toLocaleDateString('pt-BR')} às{' '}
                      {note.updatedAt.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outras anotações */}
      {otherNotes.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3">Outras Páginas</h4>
          <div className="space-y-2">
            {otherNotes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => onGoToPage(note.page)}
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Página {note.page}
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
                <div className="text-white text-sm leading-relaxed line-clamp-2">
                  {note.content}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {note.updatedAt.toLocaleDateString('pt-BR')} às{' '}
                  {note.updatedAt.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {notes.length === 0 && !isAddingNote && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <div className="text-gray-400 mb-1">Nenhuma anotação ainda</div>
          <div className="text-gray-500 text-sm">
            Clique em &quot;Nova Anotação&quot; para adicionar uma
          </div>
        </div>
      )}
    </div>
  );
}


