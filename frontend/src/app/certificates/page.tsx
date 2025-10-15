'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import CertificateCard from '@/components/certificates/CertificateCard';
import { apiClient } from '@/lib/api';

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

export default function CertificatesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      loadCertificates();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getMyCertificates();
      
      setCertificates(data || []);
    } catch (err) {
      console.error('Erro ao carregar certificados:', err);
      setError('Erro ao carregar certificados');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando certificados...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🏆 Meus Certificados</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.firstName || user?.username}!
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Certificados Conquistados</h2>
          <p className="mt-2 text-gray-600">Visualize e baixe seus certificados de conclusão de cursos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-400 mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum certificado ainda</h3>
            <p className="text-gray-600 mb-6">
              Complete cursos para receber certificados automaticamente!
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Explorar Cursos
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="text-3xl text-yellow-600">🏆</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total de Certificados</p>
                    <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="text-3xl text-green-600">📅</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Último Certificado</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(certificates[0]?.completionDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="text-3xl text-blue-600">🎓</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Cursos Concluídos</p>
                    <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}







