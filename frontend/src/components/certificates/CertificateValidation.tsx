'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CertificateValidationProps {
  certificateNumber: string;
}

interface CertificateData {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  issuedAt: string;
}

export default function CertificateValidation({ certificateNumber }: CertificateValidationProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    validateCertificate();
  }, [certificateNumber]);

  const validateCertificate = async () => {
    try {
      setLoading(true);
      const data = await apiClient.validateCertificate(certificateNumber);

      if (data.valid) {
        setCertificate(data.certificate);
      } else {
        setError(data.message || 'Certificado não encontrado');
      }
    } catch (err) {
      setError('Erro ao validar certificado');
      console.error('Error validating certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validando certificado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certificado Inválido</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🏆 Validação de Certificado</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </header>

      {/* Certificate Validation */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Certificado Válido</h1>
            <p className="text-gray-600">Este certificado foi emitido pelo Extrata Academy</p>
          </div>

          {/* Certificate Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Estudante</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{certificate.studentName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Curso</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{certificate.courseTitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Conclusão</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(certificate.completionDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Emissão</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Number */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Número do Certificado</label>
              <p className="text-2xl font-mono font-bold text-blue-600">{certificate.certificateNumber}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              🖨️ Imprimir
            </button>
            
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert('Link copiado para a área de transferência!');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              🔗 Copiar Link
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Este certificado foi emitido digitalmente pelo Extrata Academy
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Para verificar a autenticidade, acesse: www.extrata.com.br/academy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}









