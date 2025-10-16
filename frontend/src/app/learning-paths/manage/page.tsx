'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

interface LearningPathManage {
  id: string;
  title: string;
  slug: string;
  estimatedHours?: number;
  isFeatured: boolean;
}

export default function ManageLearningPathsPage() {
  const { isAuthenticated, hasRole, login } = useAuth()
  const [paths, setPaths] = useState<LearningPathManage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getLearningPaths()
        setPaths(data || [])
      } catch (e) {
        setError('Erro ao carregar trilhas')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!isAuthenticated || !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded shadow p-6">
          <div className="font-semibold mb-2">Acesso restrito</div>
          <div className="text-sm mb-4">Faça login com uma conta de administrador.</div>
          <button onClick={login} className="px-3 py-2 text-sm rounded bg-blue-600 text-white">Fazer login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Trilhas</h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Nova trilha</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-gray-600">Carregando...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimado (h)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destaque</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paths.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.estimatedHours ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.isFeatured ? 'Sim' : 'Não'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex gap-2 justify-end">
                        <button className="px-3 py-1 rounded border text-sm">Editar</button>
                        <button className="px-3 py-1 rounded border text-sm">Cursos</button>
                        <button className="px-3 py-1 rounded border text-sm text-red-600">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

