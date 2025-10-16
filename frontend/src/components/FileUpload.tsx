'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  type: 'video' | 'pdf' | 'image' | 'thumbnail' | 'avatar' | 'document';
  onUploadComplete: (fileData: UploadedFile) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

interface UploadedFile {
  id: string;
  url: string;
  originalName: string;
  mimetype: string;
  size: number;
}

export function FileUpload({
  type,
  onUploadComplete,
  accept,
  maxSizeMB = 500,
  className = '',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getAcceptString = () => {
    if (accept) return accept;
    switch (type) {
      case 'video':
        return 'video/mp4,video/webm,video/ogg';
      case 'pdf':
        return 'application/pdf';
      case 'image':
      case 'thumbnail':
      case 'avatar':
        return 'image/jpeg,image/png,image/gif,image/webp';
      case 'document':
        return '.doc,.docx,.pdf';
      default:
        return '*';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      toast.error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('keycloak-token');
      if (!token) {
        throw new Error('Não autenticado');
      }

      const xhr = new XMLHttpRequest();

      // Monitorar progresso
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded * 100) / e.total);
          setProgress(percentage);
        }
      });

      // Promessa para aguardar o upload
      const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Erro no upload: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Erro de rede'));
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/files/upload/${type}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

      const result = await uploadPromise;

      setUploadedFile(result);
      setProgress(100);
      onUploadComplete(result);
      toast.success('Upload concluído com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(errorMessage);
      toast.error('Erro ao fazer upload: ' + errorMessage);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setProgress(0);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de seleção de arquivo */}
      {!uploadedFile && !selectedFile && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept={getAcceptString()}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-input-${type}`}
          />
          <label htmlFor={`file-input-${type}`} className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Clique para selecionar ou arraste um arquivo
            </p>
            <p className="text-xs text-gray-500">
              Tamanho máximo: {maxSizeMB}MB
            </p>
          </label>
        </div>
      )}

      {/* Arquivo selecionado */}
      {selectedFile && !uploadedFile && (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Upload className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progresso */}
          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-600">
                {progress < 100 ? `Enviando... ${progress}%` : 'Processando...'}
              </p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Botão de upload */}
          {!uploading && !error && (
            <button
              onClick={handleUpload}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium mt-4 flex items-center justify-center gap-2"
              type="button"
            >
              <Upload className="w-4 h-4" />
              Fazer Upload
            </button>
          )}
        </div>
      )}

      {/* Upload concluído */}
      {uploadedFile && (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-green-900 truncate">
                  {uploadedFile.originalName}
                </p>
                <p className="text-xs text-green-700">Upload concluído</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-green-700 hover:text-green-900 p-2 rounded hover:bg-green-100"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
