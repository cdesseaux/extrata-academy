'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizAttempt } from '@/types';
import apiClient from '@/lib/api';

interface QuizResultsProps {
  quizId: string;
  onRetake?: () => void;
}

export function QuizResults({ quizId, onRetake }: QuizResultsProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [bestAttempt, setBestAttempt] = useState<QuizAttempt | null>(null);
  const [canRetake, setCanRetake] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [quizId]);

  const loadResults = async () => {
    try {
      setLoading(true);

      const [quizData, attemptsData, bestAttemptData, canRetakeData] = await Promise.all([
        apiClient.getQuiz(quizId),
        apiClient.getMyQuizAttempts(quizId),
        apiClient.getBestQuizAttempt(quizId),
        apiClient.canRetakeQuiz(quizId),
      ]);

      setQuiz(quizData);
      setAttempts(attemptsData);
      setBestAttempt(bestAttemptData);
      setCanRetake(canRetakeData);
    } catch (err) {
      console.error('Erro ao carregar resultados:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startedAt: string, completedAt?: string) => {
    if (!completedAt) return '-';
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-600">Carregando resultados...</p>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const completedAttempts = attempts.filter(a => a.completedAt);

  return (
    <div className="space-y-6">
      {/* Best Attempt Summary */}
      {bestAttempt && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🏆</span>
                <h3 className="text-xl font-bold">Melhor Resultado</h3>
              </div>
              <p className="text-sm text-gray-600">
                {bestAttempt.passed ? 'Aprovado' : 'Reprovado'} • {formatDate(bestAttempt.completedAt!)}
              </p>
            </div>
            {bestAttempt.passed ? (
              <span className="text-green-600 text-4xl">✓</span>
            ) : (
              <span className="text-red-600 text-4xl">✗</span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pontuação</span>
                <span className="text-2xl font-bold">{bestAttempt.score?.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${bestAttempt.passed ? 'bg-green-600' : 'bg-red-600'}`}
                  style={{ width: `${bestAttempt.score || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Nota mínima: {quiz.passingScore}%
              </p>
            </div>

            {quiz.showCorrectAnswers && bestAttempt.questionResults && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Acertos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bestAttempt.questionResults.filter(r => r.correct).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Erros</p>
                  <p className="text-2xl font-bold text-red-600">
                    {bestAttempt.questionResults.filter(r => !r.correct).length}
                  </p>
                </div>
              </div>
            )}

            {canRetake && (
              <button
                onClick={onRetake}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <span>📈</span>
                <span>Tentar Melhorar</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Attempts History */}
      {completedAttempts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">Histórico de Tentativas</h3>
            <p className="text-sm text-gray-600">
              {completedAttempts.length} tentativa{completedAttempts.length !== 1 ? 's' : ''} realizada{completedAttempts.length !== 1 ? 's' : ''}
              {quiz.maxAttempts > 0 && ` (Máximo: ${quiz.maxAttempts})`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pontuação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attempt.attemptNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(attempt.completedAt!)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>⏱</span>
                        <span>{calculateDuration(attempt.startedAt, attempt.completedAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {attempt.score?.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attempt.passed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="mr-1">✓</span>
                          Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <span className="mr-1">✗</span>
                          Reprovado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Attempts */}
      {completedAttempts.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">Você ainda não completou este quiz.</p>
          {canRetake && (
            <button
              onClick={onRetake}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Iniciar Quiz
            </button>
          )}
        </div>
      )}

      {/* Cannot Retake Message */}
      {!canRetake && quiz.maxAttempts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Você atingiu o número máximo de {quiz.maxAttempts} tentativa{quiz.maxAttempts !== 1 ? 's' : ''} para este quiz.
          </p>
        </div>
      )}
    </div>
  );
}
