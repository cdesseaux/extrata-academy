'use client';

import { useAuth } from '@/components/KeycloakProvider';

export default function Home() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🎓 Extrata Academy</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Olá, {user?.firstName || user?.username}!
                  </span>
                  <button 
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                Bem-vindo de volta,
                <span className="text-blue-600"> {user?.firstName || user?.username}!</span>
              </h2>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Continue sua jornada de aprendizado no Extrata Academy
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Meus Cursos
                  </button>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                Bem-vindo ao
                <span className="text-blue-600"> Extrata Academy</span>
              </h2>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Plataforma de aprendizado online para capacitação e certificação de usuários do sistema Extrata
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <button 
                    onClick={login}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Começar Agora
                  </button>
                </div>
                       <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                         <button 
                           onClick={() => window.location.href = '/courses'}
                           className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                         >
                           Ver Cursos
                         </button>
                       </div>
              </div>
            </>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cursos Interativos</h3>
              <p className="text-gray-600">
                Aprenda com vídeos, textos e quizzes interativos desenvolvidos especialmente para o sistema Extrata.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gamificação</h3>
              <p className="text-gray-600">
                Ganhe XP, suba de nível e desbloqueie badges conforme você progride nos cursos.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl mb-4">📜</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Certificados</h3>
              <p className="text-gray-600">
                Receba certificados oficiais ao completar os cursos e valide seu conhecimento.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Extrata Academy. Desenvolvido para capacitação e certificação de usuários do sistema Extrata.
            </p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Ambiente de Desenvolvimento - Versão 0.1.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
