'use client';

import { useState, useEffect } from 'react';
import { Quiz, Question, QuizAttempt, QuestionType } from '@/types';
import apiClient from '@/lib/api';

interface QuizPlayerProps {
  quizId: string;
  enrollmentId: string;
  onComplete?: (attempt: QuizAttempt) => void;
}

export function QuizPlayer({ quizId, enrollmentId, onComplete }: QuizPlayerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.timeLimit > 0 && attempt && !attempt.completedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
        const remaining = quiz.timeLimit * 60 - elapsed;

        if (remaining <= 0) {
          handleSubmit();
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [quiz, attempt]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      const quizData = await apiClient.getQuiz(quizId);
      setQuiz(quizData);

      // Verificar se pode iniciar tentativa
      const canRetake = await apiClient.canRetakeQuiz(quizId);
      if (!canRetake) {
        setError('Você atingiu o número máximo de tentativas para este quiz.');
        return;
      }

      // Iniciar tentativa
      const attemptData = await apiClient.startQuizAttempt(quizId, enrollmentId);
      setAttempt(attemptData);

      // Embaralhar questões se configurado
      if (quizData.shuffleQuestions && quizData.questions) {
        quizData.questions = shuffleArray([...quizData.questions]);
      }

      // Embaralhar opções se configurado
      if (quizData.shuffleOptions && quizData.questions) {
        quizData.questions = quizData.questions.map(q => ({
          ...q,
          options: shuffleArray([...q.options]),
        }));
      }

      setQuiz(quizData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar quiz');
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleAnswerChange = async (questionId: string, answer: string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    if (attempt) {
      try {
        await apiClient.submitAnswer(attempt.id, questionId, answer);
      } catch (err) {
        console.error('Erro ao salvar resposta:', err);
      }
    }
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions!.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attempt) return;

    try {
      setSubmitting(true);
      const result = await apiClient.submitQuiz(attempt.id);
      setAttempt(result);
      onComplete?.(result);
    } catch (err: any) {
      setError(err.message || 'Erro ao submeter quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-600">Carregando quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        ⚠️ {error}
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        ⚠️ Este quiz não possui questões.
      </div>
    );
  }

  if (attempt?.completedAt) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          {attempt.passed ? (
            <div className="text-green-600 text-6xl mb-4">✓</div>
          ) : (
            <div className="text-red-600 text-6xl mb-4">✗</div>
          )}
          <h2 className="text-2xl font-bold mb-2">
            {attempt.passed ? 'Parabéns!' : 'Quiz Concluído'}
          </h2>
          <p className="text-gray-600">
            Sua pontuação: <span className="font-bold text-xl">{attempt.score?.toFixed(1)}%</span>
            {quiz.passingScore && ` (Mínimo: ${quiz.passingScore}%)`}
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${attempt.passed ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${attempt.score || 0}%` }}
            />
          </div>
        </div>

        {quiz.showCorrectAnswers && attempt.questionResults && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">Resultados por questão:</h4>
            <div className="space-y-2">
              {quiz.questions.map((question, idx) => {
                const result = attempt.questionResults!.find(r => r.questionId === question.id);
                return (
                  <div key={question.id} className="flex items-center gap-2 text-sm">
                    {result?.correct ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    <span>Questão {idx + 1}: {result?.pointsEarned || 0} pontos</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => onComplete?.(attempt)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <p className="text-sm text-gray-600">
              Questão {currentQuestionIndex + 1} de {quiz.questions.length}
            </p>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg font-medium">
              <span>⏱</span>
              <span className={timeRemaining < 60 ? 'text-red-500' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-2">{currentQuestion.question}</h3>
        {currentQuestion.points > 0 && (
          <p className="text-sm text-gray-600 mb-4">{currentQuestion.points} pontos</p>
        )}

        <div className="mt-4">
          <QuestionInput
            question={currentQuestion}
            value={answers[currentQuestion.id] || []}
            onChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <span className="text-sm text-gray-600">
          {answeredCount} de {quiz.questions.length} respondidas
        </span>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Próxima →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Finalizando...' : 'Finalizar Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}

interface QuestionInputProps {
  question: Question;
  value: string[];
  onChange: (answer: string[]) => void;
}

function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  if (question.type === QuestionType.TRUE_FALSE) {
    return (
      <div className="space-y-2">
        {[
          { id: 'true', text: 'Verdadeiro' },
          { id: 'false', text: 'Falso' },
        ].map((option) => (
          <label key={option.id} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="true-false"
              checked={value[0] === option.id}
              onChange={() => onChange([option.id])}
              className="w-4 h-4"
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    const isMultipleAnswer = question.correctAnswers.length > 1;

    if (isMultipleAnswer) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">Selecione todas as opções corretas</p>
          {question.options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={value.includes(option.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...value, option.id]);
                  } else {
                    onChange(value.filter(v => v !== option.id));
                  }
                }}
                className="w-4 h-4"
              />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {question.options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={value[0] === option.id}
              onChange={() => onChange([option.id])}
              className="w-4 h-4"
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
      ⚠️ Tipo de questão não suportado: {question.type}
    </div>
  );
}
