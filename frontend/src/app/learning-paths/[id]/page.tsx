'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/components/AuthProvider'

export default function LearningPathDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)

  const [path, setPath] = useState<any | null>(null)
  const [enrollment, setEnrollment] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        const [p, e] = await Promise.all([
          apiClient.getLearningPath(id),
          isAuthenticated ? apiClient.getMyLearningPathEnrollment(id) : Promise.resolve(null),
        ])
        setPath(p)
        setEnrollment(e)
      } catch (e) {
        console.error(e)
        setError('Erro ao carregar trilha')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isAuthenticated])

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    try {
      setUpdating(true)
      const e = await apiClient.enrollInLearningPath(id)
      setEnrollment(e)
    } catch (e) {
      console.error(e)
      setError('Falha ao matricular na trilha')
    } finally {
      setUpdating(false)
    }
  }

  const handleProgress = async (delta: number) => {
    if (!enrollment) return
    const current = enrollment.progressPercentage ?? 0
    const next = Math.max(0, Math.min(100, current + delta))
    try {
      setUpdating(true)
      const updated = await apiClient.updateMyLearningPathProgress(id, next)
      setEnrollment(updated)
    } catch (e) {
      console.error(e)
      setError('Falha ao atualizar progresso')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">🧭 Trilha</h1>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-gray-600">Carregando...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        ) : !path ? (
          <div className="text-gray-600">Trilha não encontrada</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{path.title}</h2>
              {path.isFeatured ? (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Destaque</span>
              ) : null}
            </div>
            <p className="text-gray-700 mb-4">{path.description}</p>
            <div className="text-sm text-gray-500 mb-6">Estimado: {path.estimatedHours ?? 0} horas</div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Cursos na trilha</h3>
              <ul className="list-disc list-inside space-y-1">
                {(path.courses || [])
                  .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                  .map((c: any) => (
                    <li key={c.id} className="text-gray-700">
                      {c.course?.title || 'Curso'}
                      {c.isRequired ? ' • obrigatório' : ''}
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {!enrollment ? (
                <button
                  onClick={handleEnroll}
                  disabled={updating || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Matricular
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Progresso: {Math.round(enrollment.progressPercentage ?? 0)}%</span>
                  <button onClick={() => handleProgress(10)} disabled={updating} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-md text-sm">+10%</button>
                  <button onClick={() => handleProgress(-10)} disabled={updating} className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-3 py-2 rounded-md text-sm">-10%</button>
                </div>
              )}
            </div>

            {showLoginPrompt && (
              <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-yellow-900">Faça login para continuar</div>
                    <div className="text-sm text-yellow-800">Você precisa estar autenticado para se matricular na trilha.</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowLoginPrompt(false)} className="px-3 py-2 text-sm rounded border">Agora não</button>
                    <button onClick={login} className="px-3 py-2 text-sm rounded bg-blue-600 text-white">Fazer login</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
