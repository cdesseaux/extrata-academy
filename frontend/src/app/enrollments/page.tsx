'use client';

import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  completedAt: string | null;
  certificateUrl: string | null;
  createdAt: string;
  course?: {
    id: string;
    title: string;
    description: string;
  };
}

export default function EnrollmentsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      loadEnrollments();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      setError('Erro ao carregar suas matrículas');
      console.error('Error loading my enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando suas matrículas...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">🧾 Minhas Matrículas</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Ver Cursos
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {enrollments.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Você ainda não possui matrículas</h2>
            <p className="text-gray-600">Explore os cursos disponíveis e comece a aprender hoje mesmo!</p>
            <button
              onClick={() => router.push('/courses')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Explorar Cursos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {enrollment.course?.title || 'Curso'}
                    </h3>
                    {enrollment.course?.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {enrollment.course.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        enrollment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'enrolled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status === 'completed' ? 'Concluído' : 
                         enrollment.status === 'enrolled' ? 'Em Andamento' : enrollment.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Progresso: {enrollment.progress}%
                      </span>
                      <span className="text-sm text-gray-500">
                        Matriculado em {new Date(enrollment.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/courses/${enrollment.courseId}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Ir para o curso
                    </button>
                    {enrollment.certificateUrl && (
                      <a
                        href={enrollment.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Ver certificado
                      </a>
                    )}
                  </div>
                </div>

                {enrollment.progress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
