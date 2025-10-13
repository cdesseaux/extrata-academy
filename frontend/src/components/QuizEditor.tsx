'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Quiz, Question, QuestionType, CreateQuizDto, CreateQuestionDto } from '@/types/quiz';

interface QuizEditorProps {
  lessonId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function QuizEditor({ lessonId, onSave, onCancel }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  // Form states
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 0,
    showCorrectAnswers: true,
    maxAttempts: 1,
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { id: '1', text: '' },
      { id: '2', text: '' },
    ],
    correctAnswers: [] as string[],
    points: 1,
    explanation: '',
  });

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const existingQuiz = await apiClient.getQuizByLesson(lessonId);
      setQuiz(existingQuiz);
      setQuizForm({
        title: existingQuiz.title,
        description: existingQuiz.description || '',
        passingScore: existingQuiz.passingScore,
        timeLimit: existingQuiz.timeLimit,
        showCorrectAnswers: existingQuiz.showCorrectAnswers,
        maxAttempts: existingQuiz.maxAttempts,
      });
    } catch (error) {
      // Quiz não existe ainda, vamos criar um novo
      console.log('Quiz não encontrado, criando novo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      setSaving(true);
      const quizData: CreateQuizDto = {
        lessonId,
        ...quizForm,
      };

      if (quiz) {
        await apiClient.updateQuiz(quiz.id, quizData);
        toast.success('Quiz atualizado com sucesso!');
      } else {
        const newQuiz = await apiClient.createQuiz(quizData);
        setQuiz(newQuiz);
        toast.success('Quiz criado com sucesso!');
      }
    } catch (error: any) {
      toast.error('Erro ao salvar quiz: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!quiz) {
      toast.error('Salve o quiz primeiro antes de adicionar questões');
      return;
    }

    try {
      setSaving(true);
      const questionData: CreateQuestionDto = {
        quizId: quiz.id,
        ...questionForm,
      };

      await apiClient.addQuestion(questionData);
      toast.success('Questão adicionada com sucesso!');
      setShowAddQuestion(false);
      resetQuestionForm();
      loadQuiz(); // Recarregar para ver a nova questão
    } catch (error: any) {
      toast.error('Erro ao adicionar questão: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return;

    try {
      await apiClient.deleteQuestion(questionId);
      toast.success('Questão excluída com sucesso!');
      loadQuiz();
    } catch (error: any) {
      toast.error('Erro ao excluir questão: ' + error.message);
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      type: QuestionType.MULTIPLE_CHOICE,
      options: [
        { id: '1', text: '' },
        { id: '2', text: '' },
      ],
      correctAnswers: [],
      points: 1,
      explanation: '',
    });
  };

  const addOption = () => {
    const newId = (questionForm.options.length + 1).toString();
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { id: newId, text: '' }],
    });
  };

  const removeOption = (optionId: string) => {
    if (questionForm.options.length <= 2) return;
    
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.filter(opt => opt.id !== optionId),
      correctAnswers: questionForm.correctAnswers.filter(id => id !== optionId),
    });
  };

  const updateOption = (optionId: string, text: string) => {
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.map(opt =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    });
  };

  const toggleCorrectAnswer = (optionId: string) => {
    const isCorrect = questionForm.correctAnswers.includes(optionId);
    setQuestionForm({
      ...questionForm,
      correctAnswers: isCorrect
        ? questionForm.correctAnswers.filter(id => id !== optionId)
        : [...questionForm.correctAnswers, optionId],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {quiz ? 'Editar Quiz' : 'Criar Quiz'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quiz Settings */}
      <div className="mb-8 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Configurações do Quiz</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título do Quiz
            </label>
            <input
              type="text"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Avaliação do Módulo 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota Mínima (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={quizForm.passingScore}
              onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempo Limite (minutos)
            </label>
            <input
              type="number"
              min="0"
              value={quizForm.timeLimit}
              onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0 = sem limite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Tentativas
            </label>
            <input
              type="number"
              min="0"
              value={quizForm.maxAttempts}
              onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0 = ilimitado"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={quizForm.description}
            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Descrição do quiz..."
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={quizForm.showCorrectAnswers}
              onChange={(e) => setQuizForm({ ...quizForm, showCorrectAnswers: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Mostrar respostas corretas após o quiz</span>
          </label>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSaveQuiz}
            disabled={saving || !quizForm.title}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Quiz'}
          </button>
        </div>
      </div>

      {/* Questions */}
      {quiz && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Questões ({quiz.questions?.length || 0})</h3>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Questão
            </button>
          </div>

          {/* Existing Questions */}
          {quiz.questions?.map((question, index) => (
            <div key={question.id} className="mb-4 p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Questão {index + 1}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {question.type === QuestionType.MULTIPLE_CHOICE ? 'Múltipla Escolha' :
                       question.type === QuestionType.TRUE_FALSE ? 'Verdadeiro/Falso' : 'Dissertativa'}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {question.points} ponto{question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-2">{question.question}</p>
                  
                  {question.options && question.options.length > 0 && (
                    <div className="ml-4">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={question.correctAnswers.includes(option.id)}
                            readOnly
                            className="w-4 h-4"
                          />
                          <span className={`text-sm ${
                            question.correctAnswers.includes(option.id) 
                              ? 'text-green-600 font-medium' 
                              : 'text-gray-600'
                          }`}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Question Form */}
          {showAddQuestion && (
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Nova Questão</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pergunta
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Digite a pergunta..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={questionForm.type}
                      onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as QuestionType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={QuestionType.MULTIPLE_CHOICE}>Múltipla Escolha</option>
                      <option value={QuestionType.TRUE_FALSE}>Verdadeiro/Falso</option>
                      <option value={QuestionType.ESSAY}>Dissertativa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pontos
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={questionForm.points}
                      onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Options for Multiple Choice */}
                {questionForm.type === QuestionType.MULTIPLE_CHOICE && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opções de Resposta
                    </label>
                    {questionForm.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={questionForm.correctAnswers.includes(option.id)}
                          onChange={() => toggleCorrectAnswer(option.id)}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(option.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite a opção..."
                        />
                        {questionForm.options.length > 2 && (
                          <button
                            onClick={() => removeOption(option.id)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Opção
                    </button>
                  </div>
                )}

                {/* True/False Options */}
                {questionForm.type === QuestionType.TRUE_FALSE && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resposta Correta
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={questionForm.correctAnswers.includes('true')}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswers: ['true'] })}
                          className="mr-2"
                        />
                        Verdadeiro
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={questionForm.correctAnswers.includes('false')}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswers: ['false'] })}
                          className="mr-2"
                        />
                        Falso
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explicação (opcional)
                  </label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Explicação da resposta correta..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddQuestion}
                  disabled={saving || !questionForm.question || questionForm.correctAnswers.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adicionando...' : 'Adicionar Questão'}
                </button>
                <button
                  onClick={() => {
                    setShowAddQuestion(false);
                    resetQuestionForm();
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Concluir
        </button>
      </div>
    </div>
  );
}


