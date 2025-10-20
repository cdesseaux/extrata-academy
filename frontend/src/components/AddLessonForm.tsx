'use client';

import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { FileUpload } from './FileUpload';
import { LessonContentType } from '@/types/lesson';

interface LessonData {
  title: string;
  description: string;
  contentType: LessonContentType;
  duration: number;
  content: Record<string, unknown>;
}

interface AddLessonFormProps {
  onSubmit: (lessonData: LessonData) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    title: string;
    description: string;
    contentType: LessonContentType;
    duration: number;
    content: Record<string, unknown>;
  };
  isEditing?: boolean;
}

export function AddLessonForm({ onSubmit, onCancel, initialData, isEditing = false }: AddLessonFormProps) {
  const [contentType, setContentType] = useState<LessonContentType>(initialData?.contentType || 'video');
  const [textContent, setTextContent] = useState((initialData?.content?.textContent as string) || '');
  const [videoUrl, setVideoUrl] = useState((initialData?.content?.videoUrl as string) || '');
  const [pdfUrl, setPdfUrl] = useState((initialData?.content?.pdfUrl as string) || '');
  const [externalUrl, setExternalUrl] = useState((initialData?.content?.externalUrl as string) || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Validações específicas por tipo
    if (contentType === 'video' && !videoUrl) {
      alert('Por favor, adicione uma URL de vídeo ou faça upload de um arquivo');
      setSubmitting(false);
      return;
    }

    if (contentType === 'pdf' && !pdfUrl) {
      alert('Por favor, faça upload de um arquivo PDF');
      setSubmitting(false);
      return;
    }

    if (contentType === 'text' && !textContent) {
      alert('Por favor, adicione conteúdo de texto');
      setSubmitting(false);
      return;
    }

    // Construir objeto de conteúdo baseado no tipo
    let content: Record<string, unknown> = {};
    switch (contentType) {
      case 'video':
        content = {
          videoUrl,
          videoProvider: videoUrl.includes('youtube') ? 'youtube' : videoUrl.includes('vimeo') ? 'vimeo' : 'external'
        };
        break;
      case 'text':
        content = { textContent };
        break;
      case 'pdf':
        content = { pdfUrl };
        break;
      case 'external':
        content = { externalUrl };
        break;
      case 'quiz':
        content = {}; // Será implementado depois
        break;
    }

    const lessonData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      contentType,
      duration: parseInt(formData.get('duration') as string) || 0,
      content,
    };

    try {
      await onSubmit(lessonData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={initialData?.title || ''}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Introdução ao Módulo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Conteúdo *</label>
          <select
            name="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value as LessonContentType)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="video">📹 Vídeo</option>
            <option value="text">📝 Texto</option>
            <option value="pdf">📄 PDF</option>
            <option value="quiz">❓ Quiz</option>
            <option value="external">🔗 Link Externo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descrição</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialData?.description || ''}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Descreva o conteúdo desta lição..."
        />
      </div>

      {/* Campos específicos por tipo */}
      {contentType === 'video' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload de Vídeo *</label>
            <FileUpload
              type="video"
              onUploadComplete={(file) => setVideoUrl(file.url)}
              maxSizeMB={500}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ou Cole a URL do Vídeo *</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {videoUrl ? (
                <span className="text-green-600">✓ URL configurada: {videoUrl.substring(0, 50)}...</span>
              ) : (
                <span className="text-red-600">⚠️ Obrigatório: Suporta YouTube, Vimeo ou link direto</span>
              )}
            </p>
          </div>
        </div>
      )}

      {contentType === 'text' && (
        <div>
          <label className="block text-sm font-medium mb-2">Conteúdo de Texto</label>
          <RichTextEditor
            content={textContent}
            onChange={setTextContent}
            placeholder="Escreva o conteúdo da lição aqui..."
          />
        </div>
      )}

      {contentType === 'pdf' && (
        <div>
          <label className="block text-sm font-medium mb-2">Upload de PDF *</label>
          <FileUpload
            type="pdf"
            onUploadComplete={(file) => setPdfUrl(file.url)}
            maxSizeMB={50}
          />
          {pdfUrl && (
            <p className="text-xs text-green-600 mt-2">✓ PDF enviado com sucesso</p>
          )}
          {!pdfUrl && (
            <p className="text-xs text-red-600 mt-2">⚠️ Obrigatório: Faça upload de um arquivo PDF</p>
          )}
        </div>
      )}

      {contentType === 'external' && (
        <div>
          <label className="block text-sm font-medium mb-2">URL Externa *</label>
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/recurso"
          />
          <p className="text-xs text-gray-500 mt-1">Link para recurso externo</p>
        </div>
      )}

      {contentType === 'quiz' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm">
            🚧 Editor de Quiz será implementado em breve
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Duração (segundos)</label>
        <input
          type="number"
          name="duration"
          defaultValue={initialData?.duration || 0}
          min={0}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Estimativa de tempo para completar esta lição</p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar Lição' : 'Adicionar Lição')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
