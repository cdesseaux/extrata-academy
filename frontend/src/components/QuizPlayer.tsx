'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, Flag } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Quiz, Question, QuizAttempt, QuestionType } from '@/types/quiz';

interface QuizPlayerProps {
  quizId: string;
  enrollmentId: string;
  onComplete: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

export function QuizPlayer({ quizId, enrollmentId, onComplete, onCancel }: QuizPlayerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (attempt && quiz?.timeLimit > 0) {
      const startTime = new Date(attempt.startedAt!).getTime();
      const timeLimitMs = quiz.timeLimit * 60 * 1000;
      const endTime = startTime + timeLimitMs;
      
      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          handleSubmitQuiz();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [attempt, quiz]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const [quizData, canRetake] = await Promise.all([
        apiClient.getQuiz(quizId),
        apiClient.canRetakeQuiz(quizId),
      ]);

      if (!canRetake) {
        toast.error('Você já atingiu o limite de tentativas para este quiz');
        onCancel();
        return;
      }

      setQuiz(quizData);
      
      // Iniciar tentativa
      const newAttempt = await apiClient.startQuizAttempt(quizId, enrollmentId);
      setAttempt(newAttempt);
    } catch (error: any) {
      toast.error('Erro ao carregar quiz: ' + error.message);
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const toggleMarkQuestion = (index: number) => {
    const newMarked = new Set(markedQuestions);
    if (newMarked.has(index)) {
      newMarked.delete(index);
    } else {
      newMarked.add(index);
    }
    setMarkedQuestions(newMarked);
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;

    try {
      setSubmitting(true);
      
      // Preparar respostas no formato esperado
      const submitAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const completedAttempt = await apiClient.submitQuiz(attempt.id, {
        answers: submitAnswers,
      });

      setAttempt(completedAttempt);
      onComplete(completedAttempt);
    } catch (error: any) {
      toast.error('Erro ao finalizar quiz: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Erro ao carregar quiz</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const hasAnswered = answers[currentQuestion.id] && answers[currentQuestion.id].length > 0;
  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id] && answers[q.id].length > 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-gray-600 mt-1">{quiz.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${
              timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            Questão {currentQuestionIndex + 1} de {quiz.questions.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso</span>
          <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-3">Navegação</h3>
          <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
            {quiz.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => handleGoToQuestion(index)}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white border-blue-600'
                    : markedQuestions.has(index)
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : answers[question.id] && answers[question.id].length > 0
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{index + 1}</span>
                  {markedQuestions.has(index) && <Flag className="w-3 h-3" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-50 rounded-lg p-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentQuestion.points} ponto{currentQuestion.points !== 1 ? 's' : ''}
                </span>
                <span className="text-sm text-gray-600">
                  {currentQuestion.type === QuestionType.MULTIPLE_CHOICE ? 'Múltipla Escolha' :
                   currentQuestion.type === QuestionType.TRUE_FALSE ? 'Verdadeiro/Falso' : 'Dissertativa'}
                </span>
              </div>
              
              <button
                onClick={() => toggleMarkQuestion(currentQuestionIndex)}
                className={`p-2 rounded-md transition-colors ${
                  markedQuestions.has(currentQuestionIndex)
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Marcar para revisão"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Answer Options */}
            {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      answers[currentQuestion.id]?.includes(option.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={answers[currentQuestion.id]?.includes(option.id) || false}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQuestion.id] || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, option.id]
                          : currentAnswers.filter(id => id !== option.id);
                        handleAnswerChange(currentQuestion.id, newAnswers);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === QuestionType.TRUE_FALSE && (
              <div className="space-y-3">
                {[
                  { id: 'true', text: 'Verdadeiro' },
                  { id: 'false', text: 'Falso' },
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      answers[currentQuestion.id]?.includes(option.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id]?.includes(option.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAnswerChange(currentQuestion.id, [option.id]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-900">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === QuestionType.ESSAY && (
              <div>
                <textarea
                  value={answers[currentQuestion.id]?.[0] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, [e.target.value])}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Digite sua resposta aqui..."
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePreviousQuestion}
              disabled={isFirstQuestion}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              
              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting || !allQuestionsAnswered}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Finalizar Quiz
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Próxima
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Respondidas: {Object.keys(answers).length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              Marcadas: {markedQuestions.size}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              Restantes: {quiz.questions.length - Object.keys(answers).length}
            </span>
          </div>
          
          {timeLeft !== null && timeLeft < 300 && (
            <div className="text-red-600 font-medium">
              ⚠️ Tempo limitado!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


