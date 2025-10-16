'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Module, CreateModuleDto } from '@/types';
import { Lesson, CreateLessonDto, LessonContentType } from '@/types/lesson';

export default function ManageCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<{ id: string; title: string; description: string } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, modulesData] = await Promise.all([
        apiClient.getCourse(courseId),
        apiClient.getModulesByCourse(courseId),
      ]);
      setCourse(courseData);
      setModules(modulesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do curso');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newModule: CreateModuleDto = {
      courseId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    };

    try {
      await apiClient.createModule(newModule);
      setShowAddModule(false);
      loadCourseData();
    } catch (err) {
      alert('Erro ao criar módulo: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleAddLesson = async (e: React.FormEvent<HTMLFormElement>, moduleId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newLesson: CreateLessonDto = {
      moduleId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      contentType: formData.get('contentType') as LessonContentType,
      duration: parseInt(formData.get('duration') as string) || 0,
      content: {},
    };

    try {
      await apiClient.createLesson(newLesson);
      setShowAddLesson(null);
      loadCourseData();
    } catch (err) {
      alert('Erro ao criar lição: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return;

    try {
      await apiClient.deleteModule(moduleId);
      loadCourseData();
    } catch (err) {
      alert('Erro ao excluir módulo: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lição?')) return;

    try {
      await apiClient.deleteLesson(lessonId);
      loadCourseData();
    } catch (err) {
      alert('Erro ao excluir lição: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Voltar
        </button>
        <h1 className="text-3xl font-bold mb-2">Gerenciar Curso</h1>
        <p className="text-gray-600">{course?.title}</p>
      </div>

      {/* Add Module Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddModule(!showAddModule)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Adicionar Módulo
        </button>
      </div>

      {/* Add Module Form */}
      {showAddModule && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Novo Módulo</h3>
          <form onSubmit={handleAddModule}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-3 py-2 border rounded"
                placeholder="Nome do módulo"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-3 py-2 border rounded"
                placeholder="Descrição do módulo"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowAddModule(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-6">
        {modules.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Nenhum módulo criado ainda. Adicione o primeiro módulo acima.
          </div>
        ) : (
          modules.map((module, index) => (
            <div key={module.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Module Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    Módulo {index + 1}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-gray-600">{module.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {module.lessons?.length || 0} lições · {Math.floor(module.duration / 60)}h {module.duration % 60}min
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  🗑️
                </button>
              </div>

              {/* Lessons List */}
              <div className="ml-4 space-y-2">
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.map((lesson: Lesson, lessonIndex: number) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <div className="flex-1">
                        <span className="font-medium">
                          {lessonIndex + 1}. {lesson.title}
                        </span>
                        <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {lesson.contentType}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma lição adicionada</p>
                )}
              </div>

              {/* Add Lesson Button */}
              <div className="mt-4">
                <button
                  onClick={() => setShowAddLesson(showAddLesson === module.id ? null : module.id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  + Adicionar Lição
                </button>
              </div>

              {/* Add Lesson Form */}
              {showAddLesson === module.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <form onSubmit={(e) => handleAddLesson(e, module.id)}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Título</label>
                        <input
                          type="text"
                          name="title"
                          required
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo</label>
                        <select
                          name="contentType"
                          required
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="video">Vídeo</option>
                          <option value="text">Texto</option>
                          <option value="pdf">PDF</option>
                          <option value="quiz">Quiz</option>
                          <option value="external">Link Externo</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Descrição</label>
                      <textarea
                        name="description"
                        rows={2}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Duração (segundos)</label>
                      <input
                        type="number"
                        name="duration"
                        defaultValue={0}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddLesson(null)}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
