'use client';

import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Course {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  completedAt: string | null;
  certificateUrl: string | null;
  createdAt: string;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Carrega dados do curso sempre, independente de estar logado
    loadCourseData();
  }, [resolvedParams.id]);

  // Recarrega dados quando o status de autenticação mudar
  useEffect(() => {
    if (!isLoading) {
      loadCourseData();
    }
  }, [isAuthenticated, isLoading, resolvedParams.id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseData = await apiClient.getCourse(resolvedParams.id);
      setCourse(courseData);
      
      // Só carrega matrículas se estiver logado
      if (isAuthenticated) {
        try {
          const enrollmentsData = await apiClient.getMyEnrollments();
          const userEnrollment = enrollmentsData.find((e: Enrollment) => e.courseId === resolvedParams.id);
          setEnrollment(userEnrollment || null);
        } catch (err) {
          console.log('Usuário não logado ou erro ao carregar matrículas');
        }
      }
    } catch (err) {
      setError('Erro ao carregar dados do curso');
      console.error('Error loading course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    
    try {
      setEnrolling(true);
      await apiClient.enrollInCourse(course.id);
      await loadCourseData(); // Recarregar dados para mostrar a matrícula
    } catch (err) {
      setError('Erro ao se matricular no curso');
      console.error('Error enrolling in course:', err);
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando curso...</p>
        </div>
      </div>
    );
  }

  // Remove a verificação de autenticação - curso pode ser visto sem login

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Curso não encontrado</h2>
          <p className="text-gray-600 mb-4">
            O curso que você está procurando não existe ou foi removido.
          </p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Voltar para Cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📚 {course.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => router.push('/courses')}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Voltar para Cursos
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              course.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {course.isActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Status da Matrícula */}
          {!isAuthenticated ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Faça login para se matricular</h3>
              <p className="text-yellow-700 mb-4">
                Você precisa estar logado para se matricular neste curso.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Fazer Login
              </button>
            </div>
          ) : enrollment ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Status da Matrícula</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Status</p>
                  <p className="text-blue-900 capitalize">{enrollment.status}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Progresso</p>
                  <p className="text-blue-900">{enrollment.progress}%</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Matriculado em</p>
                  <p className="text-blue-900">
                    {new Date(enrollment.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              {enrollment.progress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Botão para iniciar/continuar curso */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => router.push(`/courses/${course.id}/learn`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {enrollment.progress > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                </button>
                
                {enrollment.certificateUrl && (
                  <button
                    onClick={() => window.open(enrollment.certificateUrl, '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Ver Certificado
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Não matriculado</h3>
              <p className="text-gray-600 mb-4">
                Você ainda não está matriculado neste curso. Clique no botão abaixo para se matricular.
              </p>
              <button
                onClick={handleEnroll}
                disabled={enrolling || !course.isActive}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                  enrolling || !course.isActive
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {enrolling ? 'Matriculando...' : 'Matricular-se no Curso'}
              </button>
            </div>
          )}

          {/* Informações do Curso */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações do Curso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Criado em</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(course.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Última atualização</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(course.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

