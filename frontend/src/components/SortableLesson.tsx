'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lesson, LessonContentType } from '@/types';
import { GripVertical, Trash2, Edit3 } from 'lucide-react';

interface SortableLessonProps {
  lesson: Lesson;
  index: number;
  onDelete: (lessonId: string) => void;
  onEditQuiz?: (lessonId: string) => void;
}

export function SortableLesson({
  lesson,
  index,
  onDelete,
  onEditQuiz,
}: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getContentTypeIcon = (type: LessonContentType) => {
    switch (type) {
      case 'video': return '📹';
      case 'text': return '📝';
      case 'pdf': return '📄';
      case 'quiz': return '❓';
      case 'external': return '🔗';
      default: return '📄';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 group"
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xl">{getContentTypeIcon(lesson.contentType)}</span>
        <div className="flex-1">
          <span className="font-medium">
            {index + 1}. {lesson.title}
          </span>
          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {lesson.contentType}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {lesson.contentType === LessonContentType.QUIZ && onEditQuiz && (
          <button
            onClick={() => onEditQuiz(lesson.id)}
            className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-opacity"
            title="Editar Quiz"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(lesson.id)}
          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-opacity"
          title="Excluir lição"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
