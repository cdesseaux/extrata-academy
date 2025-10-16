'use client';

import { useState, useEffect } from 'react';
import { Quiz, Question, QuestionType, CreateQuestionDto, UpdateQuizDto } from '@/types';
import apiClient from '@/lib/api';

interface QuizEditorProps {
  quizId?: string;
  lessonId: string;
  onSave?: (quiz: Quiz) => void;
  onCancel?: () => void;
}

export function QuizEditor({ quizId, lessonId, onSave, onCancel }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      const data = await apiClient.getQuiz(quizId);
      setQuiz(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setPassingScore(data.passingScore);
      setTimeLimit(data.timeLimit);
      setMaxAttempts(data.maxAttempts);
      setShowCorrectAnswers(data.showCorrectAnswers);
      setShuffleQuestions(data.shuffleQuestions);
      setShuffleOptions(data.shuffleOptions);
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      setSaving(true);
      setError(null);

      const quizData: UpdateQuizDto = {
        title,
        description,
        passingScore,
        timeLimit,
        maxAttempts,
        showCorrectAnswers,
        shuffleQuestions,
        shuffleOptions,
      };

      let savedQuiz: Quiz;
      if (quizId) {
        savedQuiz = await apiClient.updateQuiz(quizId, quizData);
      } else {
        savedQuiz = await apiClient.createQuiz({ ...quizData, lessonId });
      }

      setQuiz(savedQuiz);
      onSave?.(savedQuiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Deseja realmente excluir esta questão?')) return;

    try {
      await apiClient.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir questão');
    }
  };

  const handleQuestionSaved = (question: Question) => {
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === question.id ? question : q));
    } else {
      setQuestions([...questions, question]);
    }
    setShowQuestionModal(false);
    setEditingQuestion(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-600">Carregando quiz...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          {quizId ? 'Editar Quiz' : 'Criar Novo Quiz'}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-red-800">
            ⚠️ {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Quiz de JavaScript - Módulo 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o conteúdo do quiz..."
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota Mínima (%) *
              </label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo Limite (minutos, 0 = ilimitado)
              </label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Tentativas (0 = ilimitado)
              </label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-4 border-t">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCorrectAnswers}
                onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Mostrar respostas corretas após conclusão</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Embaralhar questões</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Embaralhar opções de resposta</span>
            </label>
          </div>

          {/* Save Quiz Button */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSaveQuiz}
              disabled={saving || !title}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : quizId ? 'Atualizar Quiz' : 'Criar Quiz'}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Questions Section */}
      {(quiz || quizId) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Questões</h3>
              <p className="text-sm text-gray-600">
                {questions.length} questão{questions.length !== 1 ? 'ões' : ''} cadastrada{questions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <span>+</span>
              <span>Adicionar Questão</span>
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">Nenhuma questão cadastrada ainda.</p>
              <p className="text-sm">Clique em &quot;Adicionar Questão&quot; para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          {question.type}
                        </span>
                        <span className="text-sm text-gray-600">{question.points} pontos</span>
                      </div>
                      <p className="font-medium mb-2">{question.question}</p>
                      <div className="text-sm text-gray-600">
                        {question.options.length} opções • {question.correctAnswers.length} resposta(s) correta(s)
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <QuestionModal
          quizId={quiz?.id || quizId!}
          question={editingQuestion}
          onSave={handleQuestionSaved}
          onCancel={() => {
            setShowQuestionModal(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}

// Question Modal Component
interface QuestionModalProps {
  quizId: string;
  question: Question | null;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

function QuestionModal({ quizId, question, onSave, onCancel }: QuestionModalProps) {
  const [type, setType] = useState<QuestionType>(question?.type || QuestionType.MULTIPLE_CHOICE);
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [points, setPoints] = useState(question?.points || 1);
  const [options, setOptions] = useState(question?.options || [{ id: '1', text: '' }, { id: '2', text: '' }]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(question?.correctAnswers || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => {
    const newId = String(options.length + 1);
    setOptions([...options, { id: newId, text: '' }]);
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter(o => o.id !== id));
    setCorrectAnswers(correctAnswers.filter(a => a !== id));
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleCorrectAnswerToggle = (id: string) => {
    if (type === QuestionType.MULTIPLE_CHOICE && correctAnswers.length === 1 && !correctAnswers.includes(id)) {
      // Single answer for MULTIPLE_CHOICE - replace
      setCorrectAnswers([id]);
    } else {
      // Multiple answers allowed or toggling off
      if (correctAnswers.includes(id)) {
        setCorrectAnswers(correctAnswers.filter(a => a !== id));
      } else {
        setCorrectAnswers([...correctAnswers, id]);
      }
    }
  };

  const handleSave = async () => {
    if (!questionText.trim()) {
      setError('Digite a pergunta');
      return;
    }

    if (type !== QuestionType.TRUE_FALSE) {
      if (options.some(o => !o.text.trim())) {
        setError('Preencha todas as opções');
        return;
      }
      if (correctAnswers.length === 0) {
        setError('Selecione ao menos uma resposta correta');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      const questionData: CreateQuestionDto = {
        quizId,
        type,
        question: questionText,
        points,
        options: type === QuestionType.TRUE_FALSE ? [] : options,
        correctAnswers: type === QuestionType.TRUE_FALSE ? correctAnswers : correctAnswers,
      };

      let savedQuestion: Question;
      if (question) {
        savedQuestion = await apiClient.updateQuestion(question.id, questionData);
      } else {
        savedQuestion = await apiClient.addQuestion(questionData);
      }

      onSave(savedQuestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar questão');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">
            {question ? 'Editar Questão' : 'Nova Questão'}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800">
              ⚠️ {error}
            </div>
          )}

          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Questão
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as QuestionType);
                if (e.target.value === QuestionType.TRUE_FALSE) {
                  setOptions([
                    { id: 'true', text: 'Verdadeiro' },
                    { id: 'false', text: 'Falso' }
                  ]);
                  setCorrectAnswers([]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={QuestionType.MULTIPLE_CHOICE}>Múltipla Escolha</option>
              <option value={QuestionType.TRUE_FALSE}>Verdadeiro/Falso</option>
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pergunta *
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite a pergunta..."
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pontos
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min={1}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Options */}
          {type === QuestionType.TRUE_FALSE ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resposta Correta *
              </label>
              <div className="space-y-2">
                {[{ id: 'true', text: 'Verdadeiro' }, { id: 'false', text: 'Falso' }].map((option) => (
                  <label key={option.id} className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={correctAnswers.includes(option.id)}
                      onChange={() => setCorrectAnswers([option.id])}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opções de Resposta *
              </label>
              <p className="text-sm text-gray-600 mb-2">
                {correctAnswers.length > 1 ? 'Múltiplas respostas corretas' : 'Marque a resposta correta'}
              </p>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={correctAnswers.includes(option.id)}
                      onChange={() => handleCorrectAnswerToggle(option.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                      placeholder={`Opção ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(option.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddOption}
                className="mt-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                + Adicionar Opção
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Questão'}
          </button>
        </div>
      </div>
    </div>
  );
}
