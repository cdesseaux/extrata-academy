'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { Module, CreateModuleDto } from '@/types';
import { CreateLessonDto, LessonContentType } from '@/types/lesson';
import { SortableModule } from '@/components/SortableModule';
import { AddLessonForm } from '@/components/AddLessonForm';
import { PageHeaderSkeleton, ModuleListSkeleton } from '@/components/LoadingSkeleton';
import { QuizEditor } from '@/components/QuizEditor';
import { ArrowLeft, Plus, Loader2, X } from 'lucide-react';

export default function ManageCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null);
  const [editingQuizLessonId, setEditingQuizLessonId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCourseData();
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
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar dados do curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally
    const newModules = arrayMove(modules, oldIndex, newIndex);
    setModules(newModules);

    // Save to backend
    try {
      setSaving(true);
      await apiClient.reorderModules(
        courseId,
        newModules.map((m) => m.id)
      );
      toast.success('Módulos reordenados com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao salvar reordenação');
      // Revert on error
      setModules(modules);
    } finally {
      setSaving(false);
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
      toast.success('Módulo criado com sucesso!');
      setShowAddModule(false);
      (e.target as HTMLFormElement).reset();
      loadCourseData();
    } catch (err: any) {
      toast.error('Erro ao criar módulo: ' + err.message);
    }
  };

  const handleAddLesson = async (lessonData: any) => {
    if (!showAddLesson) return;

    const newLesson: CreateLessonDto = {
      moduleId: showAddLesson,
      title: lessonData.title,
      description: lessonData.description,
      contentType: lessonData.contentType,
      duration: lessonData.duration,
      content: lessonData.content,
    };

    try {
      await apiClient.createLesson(newLesson);
      toast.success('Lição criada com sucesso!');
      setShowAddLesson(null);
      loadCourseData();
    } catch (err: any) {
      toast.error('Erro ao criar lição: ' + err.message);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await apiClient.deleteModule(moduleId);
      toast.success('Módulo excluído com sucesso!');
      loadCourseData();
    } catch (err: any) {
      toast.error('Erro ao excluir módulo: ' + err.message);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await apiClient.deleteLesson(lessonId);
      toast.success('Lição excluída com sucesso!');
      loadCourseData();
    } catch (err: any) {
      toast.error('Erro ao excluir lição: ' + err.message);
    }
  };

  const handleReorderLessons = async (moduleId: string, lessonIds: string[]) => {
    try {
      setSaving(true);
      await apiClient.reorderLessons(moduleId, lessonIds);
      toast.success('Lições reordenadas com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao salvar reordenação de lições');
      // Reload on error
      loadCourseData();
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuiz = (lessonId: string) => {
    setEditingQuizLessonId(lessonId);
  };

  const handleQuizSaved = () => {
    setEditingQuizLessonId(null);
    toast.success('Quiz salvo com sucesso!');
    loadCourseData();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeaderSkeleton />
        <div className="mb-6">
          <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <ModuleListSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">⚠️ Erro ao carregar curso</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="text-4xl font-bold mb-2">Gerenciar Conteúdo</h1>
        <p className="text-gray-600 text-lg">{course?.title}</p>
        {saving && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Salvando alterações...
          </div>
        )}
      </div>

      {/* Add Module Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddModule(!showAddModule)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Adicionar Módulo
        </button>
      </div>

      {/* Add Module Form */}
      {showAddModule && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-200">
          <h3 className="text-2xl font-semibold mb-4">Novo Módulo</h3>
          <form onSubmit={handleAddModule}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Título *</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Introdução ao Curso"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o conteúdo deste módulo..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Criar Módulo
              </button>
              <button
                type="button"
                onClick={() => setShowAddModule(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modules List with Drag and Drop */}
      {modules.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">📚 Nenhum módulo criado ainda</p>
          <p className="text-gray-400 text-sm">
            Adicione o primeiro módulo para começar a estruturar seu curso
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
            💡 <strong>Dica:</strong> Arraste os módulos para reordená-los. As alterações são salvas automaticamente.
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              {modules.map((module, index) => (
                <SortableModule
                  key={module.id}
                  module={module}
                  index={index}
                  onDelete={handleDeleteModule}
                  onAddLesson={setShowAddLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onReorderLessons={handleReorderLessons}
                  onEditQuiz={handleEditQuiz}
                />
              ))}
            </SortableContext>
          </DndContext>
        </>
      )}

      {/* Add Lesson Modal */}
      {showAddLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Nova Lição</h3>
              <AddLessonForm
                onSubmit={handleAddLesson}
                onCancel={() => setShowAddLesson(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quiz Editor Modal */}
      {editingQuizLessonId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-semibold">Editar Quiz</h3>
              <button
                onClick={() => setEditingQuizLessonId(null)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
              <QuizEditor
                lessonId={editingQuizLessonId}
                onSave={handleQuizSaved}
                onCancel={() => setEditingQuizLessonId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
