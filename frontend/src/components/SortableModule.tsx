'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Module, Lesson, LessonContentType } from '@/types';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { SortableLesson } from './SortableLesson';
import { useState, useEffect } from 'react';

interface SortableModuleProps {
  module: Module;
  index: number;
  onDelete: (id: string) => void;
  onAddLesson: (moduleId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onReorderLessons: (moduleId: string, lessonIds: string[]) => void;
  onEditQuiz?: (lessonId: string) => void;
}

export function SortableModule({
  module,
  index,
  onDelete,
  onAddLesson,
  onDeleteLesson,
  onReorderLessons,
  onEditQuiz,
}: SortableModuleProps) {
  const [lessons, setLessons] = useState<Lesson[]>(module.lessons || []);

  // Sync lessons when module updates
  useEffect(() => {
    setLessons(module.lessons || []);
  }, [module.lessons]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const lessonSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newLessons = arrayMove(lessons, oldIndex, newIndex);
    setLessons(newLessons);

    // Notify parent
    onReorderLessons(module.id, newLessons.map((l) => l.id));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-md p-6 mb-4"
    >
      {/* Module Header */}
      <div className="flex items-start gap-3 mb-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">
            Módulo {index + 1}: {module.title}
          </h3>
          {module.description && (
            <p className="text-gray-600 text-sm">{module.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {module.lessons?.length || 0} lições · {Math.floor(module.duration / 60)}h {module.duration % 60}min
          </p>
        </div>

        <button
          onClick={() => onDelete(module.id)}
          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
          title="Excluir módulo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Lessons List */}
      <div className="ml-8 space-y-2">
        {lessons && lessons.length > 0 ? (
          <DndContext
            sensors={lessonSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={lessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {lessons.map((lesson: Lesson, lessonIndex: number) => (
                <SortableLesson
                  key={lesson.id}
                  lesson={lesson}
                  index={lessonIndex}
                  onDelete={onDeleteLesson}
                  onEditQuiz={onEditQuiz}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-gray-500 text-sm italic py-2">Nenhuma lição adicionada</p>
        )}

        {/* Add Lesson Button */}
        <button
          onClick={() => onAddLesson(module.id)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-3 rounded hover:bg-blue-50 w-full justify-center border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Lição
        </button>
      </div>
    </div>
  );
}
