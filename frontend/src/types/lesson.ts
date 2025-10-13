export enum LessonContentType {
  VIDEO = 'video',
  TEXT = 'text',
  PDF = 'pdf',
  QUIZ = 'quiz',
  EXTERNAL = 'external',
}

export interface LessonContent {
  // Para VIDEO
  videoUrl?: string;
  videoProvider?: 'youtube' | 'vimeo' | 's3' | 'external';
  videoId?: string;

  // Para TEXT
  textContent?: string; // HTML/Markdown

  // Para PDF
  pdfUrl?: string;

  // Para QUIZ
  quizId?: string;

  // Para EXTERNAL
  externalUrl?: string;

  // Comum
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  contentType: LessonContentType;
  content?: LessonContent;
  duration: number; // em segundos
  isActive: boolean;
  isFree: boolean; // Preview gratuito
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonDto {
  moduleId: string;
  title: string;
  description?: string;
  order?: number;
  contentType: LessonContentType;
  content?: LessonContent;
  duration?: number;
  isActive?: boolean;
  isFree?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  order?: number;
  contentType?: LessonContentType;
  content?: LessonContent;
  duration?: number;
  isActive?: boolean;
  isFree?: boolean;
}

export interface ReorderLessonsDto {
  lessonIds: string[];
}

export interface CompleteLessonDto {
  enrollmentId: string;
  watchTime?: number;
}

export interface UpdateWatchTimeDto {
  enrollmentId: string;
  watchTime: number;
  lastPosition: number;
}
