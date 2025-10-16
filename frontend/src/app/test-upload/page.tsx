'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { useAuth } from '@/components/AuthProvider';
import axios from 'axios';

export default function TestUploadPage() {
  const { isAuthenticated, user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());

  const getPresignedUrl = async (fileId: string) => {
    try {
      setLoadingUrls((prev) => new Set(prev).add(fileId));
      const token = localStorage.getItem('keycloak-token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/files/${fileId}/url`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoadingUrls((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      return response.data.url;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      setLoadingUrls((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Você precisa estar autenticado
          </h1>
          <p className="text-gray-600">Faça login para testar o upload</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste de Upload S3
          </h1>
          <p className="text-gray-600 mb-8">
            Olá, <strong>{user?.firstName || user?.username}</strong>! Teste o upload de arquivos para o S3.
          </p>

          <div className="space-y-8">
            {/* Upload de PDF */}
            <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                📄 Upload de PDF
              </h2>
              <FileUpload
                type="pdf"
                onUploadComplete={(file) => {
                  console.log('PDF uploaded:', file);
                  setUploadedFiles([...uploadedFiles, { type: 'PDF', ...file }]);
                }}
                maxSizeMB={50}
              />
            </div>

            {/* Upload de Vídeo */}
            <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">
                🎥 Upload de Vídeo
              </h2>
              <FileUpload
                type="video"
                onUploadComplete={(file) => {
                  console.log('Video uploaded:', file);
                  setUploadedFiles([...uploadedFiles, { type: 'Video', ...file }]);
                }}
                maxSizeMB={500}
              />
            </div>

            {/* Upload de Imagem */}
            <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                🖼️ Upload de Imagem
              </h2>
              <FileUpload
                type="image"
                onUploadComplete={(file) => {
                  console.log('Image uploaded:', file);
                  setUploadedFiles([...uploadedFiles, { type: 'Image', ...file }]);
                }}
                maxSizeMB={10}
              />
            </div>
          </div>

          {/* Lista de arquivos enviados */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✅ Arquivos Enviados ({uploadedFiles.length})
              </h2>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                            {file.type}
                          </span>
                          <h3 className="font-medium text-gray-900">
                            {file.originalName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>ID:</strong> {file.id}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Tamanho:</strong>{' '}
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 break-all">
                            <strong>S3 Key:</strong> {file.url}
                          </p>
                          <button
                            onClick={async () => {
                              const presignedUrl = await getPresignedUrl(file.id);
                              if (presignedUrl) {
                                window.open(presignedUrl, '_blank');
                              } else {
                                alert('Erro ao gerar URL assinada');
                              }
                            }}
                            disabled={loadingUrls.has(file.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
                          >
                            {loadingUrls.has(file.id) ? 'Gerando URL...' : '🔗 Abrir Arquivo (Presigned URL)'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              🔒 Acesso Privado com Presigned URLs
            </h3>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li><strong>Arquivos privados:</strong> Os arquivos ficam no S3 sem acesso público</li>
              <li><strong>URLs temporárias:</strong> Click no botão para gerar uma URL assinada (válida por 1 hora)</li>
              <li><strong>Segurança:</strong> Apenas usuários autenticados podem gerar URLs</li>
              <li><strong>Expiração:</strong> As URLs expiram automaticamente após 1 hora</li>
              <li>Abra o console do navegador (F12) para ver logs detalhados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
