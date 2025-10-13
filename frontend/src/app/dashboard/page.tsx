'use client';

import { useAuth } from '@/components/KeycloakProvider';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import XPDisplay from '@/components/gamification/XPDisplay';
import AchievementsDisplay from '@/components/gamification/AchievementsDisplay';
import Leaderboard from '@/components/gamification/Leaderboard';
import XPNotification from '@/components/gamification/XPNotification';
import { useGamification } from '@/hooks/useGamification';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnimatedCard, FadeIn } from '@/components/AnimatedCard';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  completedAt: string | null;
  certificateUrl: string | null;
  createdAt: string;
  course: {
    id: string;
    title: string;
    description: string;
  };
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notifications, removeNotification, addXP, updateStreak } = useGamification();

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
      setError('Erro ao carregar matrículas');
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎓 Extrata Academy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Olá, {user?.firstName || user?.username}!
              </span>
            <button 
              onClick={() => router.push('/enrollments')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Minhas Matrículas
            </button>
            <button 
              onClick={() => router.push('/certificates')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Meus Certificados
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

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Gerencie seus cursos e acompanhe seu progresso</p>
            </div>
            <div className="flex space-x-2">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Gamification Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <XPDisplay />
          </div>
          <div>
            <Leaderboard />
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <AchievementsDisplay />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-blue-600">📚</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cursos Inscritos</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-green-600">✅</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cursos Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="text-3xl text-yellow-600">🏆</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.certificateUrl).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Enrollments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Meus Cursos</h3>
            <button
              onClick={() => router.push('/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Ver Todos os Cursos
            </button>
          </div>
          
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl text-gray-400 mb-4">📚</div>
              <p className="text-gray-500">Você ainda não está matriculado em nenhum curso</p>
              <p className="text-sm text-gray-400 mt-2">Explore os cursos disponíveis e comece sua jornada de aprendizado!</p>
              <button
                onClick={() => router.push('/courses')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Explorar Cursos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{enrollment.course.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{enrollment.course.description}</p>
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
                    <div className="ml-4">
                      <button
                        onClick={() => router.push(`/courses/${enrollment.courseId}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Ver Curso
                      </button>
                    </div>
                  </div>
                  
                  {enrollment.progress > 0 && (
                    <div className="mt-3">
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
        </div>
      </main>

      {/* Notifications */}
      {notifications.map((notification) => (
        <XPNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          amount={notification.amount}
          isVisible={true}
          onClose={() => removeNotification(notification.id)}
        />
      ))}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
