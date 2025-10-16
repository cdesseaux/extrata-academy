'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Quiz, QuizAttempt, QuestionType } from '@/types/quiz';

interface QuizResultsProps {
  attempt: QuizAttempt;
  onRetake: () => void;
  onClose: () => void;
}

export function QuizResults({ attempt, onRetake, onClose }: QuizResultsProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [canRetake, setCanRetake] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizData();
  }, [attempt.quizId]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const [quizData, retakeStatus] = await Promise.all([
        apiClient.getQuiz(attempt.quizId),
        apiClient.canRetakeQuiz(attempt.quizId),
      ]);
      
      setQuiz(quizData);
      setCanRetake(retakeStatus);
    } catch (error) {
      toast.error('Erro ao carregar dados do quiz: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'text-green-600';
    if (score >= passingScore * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'bg-green-100';
    if (score >= passingScore * 0.8) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Erro ao carregar resultados</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
          attempt.passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {attempt.passed ? (
            <Trophy className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {attempt.passed ? 'Parabéns!' : 'Tente Novamente'}
        </h2>
        
        <p className="text-gray-600">
          {attempt.passed 
            ? 'Você passou no quiz!' 
            : `Você precisa de ${quiz.passingScore}% para passar.`
          }
        </p>
      </div>

      {/* Score Card */}
      <div className={`rounded-lg p-6 mb-8 ${getScoreBgColor(attempt.score, quiz.passingScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sua Pontuação</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(attempt.score, quiz.passingScore)}`}>
                {attempt.score}%
              </span>
              <span className="text-gray-600">
                de {quiz.passingScore}% necessário
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {attempt.startedAt && attempt.completedAt 
                  ? formatDuration(attempt.startedAt, attempt.completedAt)
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-4 h-4" />
              <span className="text-sm">Tentativa {attempt.attemptNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Questões</h4>
          <p className="text-2xl font-bold text-blue-600">{quiz.questions.length}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Corretas</h4>
          <p className="text-2xl font-bold text-green-600">
            {attempt.feedback?.filter(f => f.isCorrect).length || 0}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Incorretas</h4>
          <p className="text-2xl font-bold text-red-600">
            {attempt.feedback?.filter(f => !f.isCorrect).length || 0}
          </p>
        </div>
      </div>

      {/* Detailed Results */}
      {quiz.showCorrectAnswers && attempt.feedback && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalhamento das Respostas</h3>
          
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const feedback = attempt.feedback?.find(f => f.questionId === question.id);
              const isCorrect = feedback?.isCorrect || false;
              
              return (
                <div key={question.id} className={`border rounded-lg p-4 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <XCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          Questão {index + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({question.points} ponto{question.points !== 1 ? 's' : ''})
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-3">{question.question}</p>
                      
                      {/* User Answer */}
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Sua resposta:</span>
                        <div className="mt-1">
                          {question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE ? (
                            <div className="space-y-1">
                              {feedback?.userAnswer.map(answerId => {
                                const option = question.options?.find(opt => opt.id === answerId);
                                return option ? (
                                  <span key={answerId} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2">
                                    {option.text}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-800 bg-gray-100 p-2 rounded text-sm">
                              {feedback?.userAnswer[0] || 'Sem resposta'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Correct Answer */}
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Resposta correta:</span>
                        <div className="mt-1">
                          {question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE ? (
                            <div className="space-y-1">
                              {question.correctAnswers.map(answerId => {
                                const option = question.options?.find(opt => opt.id === answerId);
                                return option ? (
                                  <span key={answerId} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2">
                                    {option.text}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-gray-800 bg-gray-100 p-2 rounded text-sm">
                              Resposta dissertativa
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <span className="text-sm font-medium text-blue-800">Explicação:</span>
                          <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Fechar
        </button>
        
        <div className="flex gap-3">
          {canRetake && (
            <button
              onClick={onRetake}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar Novamente
            </button>
          )}
          
          {attempt.passed && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Continuar Curso
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


