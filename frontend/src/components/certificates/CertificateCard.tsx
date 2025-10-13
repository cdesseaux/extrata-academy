'use client';

import { useState } from 'react';

interface Certificate {
  id: string;
  certificateNumber: string;
  title: string;
  studentName: string;
  completionDate: string;
  certificateUrl: string;
  course: {
    id: string;
    title: string;
    description: string;
  };
}

interface CertificateCardProps {
  certificate: Certificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Usar o endpoint de download do backend
      const response = await fetch(`http://localhost:4000/certificates/download/${certificate.certificateNumber}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${certificate.certificateNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Erro ao baixar certificado:', response.status, response.statusText);
        alert('Erro ao baixar certificado');
      }
    } catch (error) {
      console.error('Erro ao baixar certificado:', error);
      alert('Erro ao baixar certificado');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: `Certificado: ${certificate.title}`,
      text: `Concluí o curso "${certificate.title}" no Extrata Academy!`,
      url: `${window.location.origin}/certificates/validate/${certificate.certificateNumber}`,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copiar para clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link do certificado copiado para a área de transferência!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{certificate.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            Certificado Nº: <span className="font-mono text-blue-600">{certificate.certificateNumber}</span>
          </p>
          <p className="text-sm text-gray-500">
            Concluído em {new Date(certificate.completionDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="text-4xl text-yellow-500">🏆</div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Baixando...
            </>
          ) : (
            <>
              📄 Baixar PDF
            </>
          )}
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
        >
          🔗 Compartilhar
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Este certificado pode ser verificado online através do código QR ou número do certificado.
        </p>
      </div>
    </div>
  );
}







