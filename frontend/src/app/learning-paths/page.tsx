'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

interface LearningPathSummary {
  id: string;
  title: string;
  description: string;
  estimatedHours?: number;
  isFeatured: boolean;
}

export default function LearningPathsPage() {
  const router = useRouter()
  const [paths, setPaths] = useState<LearningPathSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getLearningPaths()
        setPaths(data || [])
      } catch (e) {
        console.error(e)
        setError('Erro ao carregar trilhas')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">🧭 Trilhas de Aprendizagem</h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-gray-600">Carregando...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        ) : paths.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma trilha disponível</h2>
            <p className="text-gray-600">Volte mais tarde!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{p.title}</h3>
                  {p.isFeatured ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Destaque</span>
                  ) : null}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">~ {p.estimatedHours ?? 0} h</span>
                  <button
                    onClick={() => router.push(`/learning-paths/${p.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
