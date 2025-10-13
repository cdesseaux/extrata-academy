export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  enrollmentId: string;
  completed: boolean;
  completedAt?: string;
  watchTime: number; // em segundos
  lastPosition?: number; // última posição do vídeo
  metadata?: any; // Quiz scores, etc.
  createdAt: string;
  updatedAt: string;
}
