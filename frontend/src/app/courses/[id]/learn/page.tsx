'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { Module, Lesson, LessonContentType, Quiz, QuizAttempt } from '@/types';
import { Skeleton } from '@/components/LoadingSkeleton';
import { QuizPlayer } from '@/components/QuizPlayer';
import { QuizResults } from '@/components/QuizResults';
import { AdvancedVideoPlayer } from '@/components/AdvancedVideoPlayer';
import { AdvancedPDFViewer } from '@/components/AdvancedPDFViewer';

export default function LearnCoursePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonIdFromUrl = searchParams.get('lesson');

  const [course, setCourse] = useState<{ id: string; title: string; description: string } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<{ id: string; courseId: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizMode, setQuizMode] = useState<'play' | 'results'>('results');

  useEffect(() => {
    loadCourseData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (lessonIdFromUrl && modules.length > 0) {
      loadLesson(lessonIdFromUrl);
    } else if (modules.length > 0 && !currentLesson) {
      // Auto-select first lesson
      const firstModule = modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        const firstLesson = firstModule.lessons[0];
        setCurrentLesson(firstLesson);
      }
    }
  }, [lessonIdFromUrl, modules]);

  useEffect(() => {
    if (currentLesson?.contentType === LessonContentType.QUIZ) {
      loadQuiz(currentLesson.id);
    } else {
      setQuiz(null);
      setQuizMode('results');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, modulesData, enrollmentsData] = await Promise.all([
        apiClient.getCourse(courseId),
        apiClient.getModulesByCourse(courseId),
        apiClient.getMyEnrollments(),
      ]);

      setCourse(courseData);
      setModules(modulesData);

      // Find enrollment for this course
      const courseEnrollment = enrollmentsData.find((e: { courseId: string }) => e.courseId === courseId);
      setEnrollment(courseEnrollment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (lessonId: string) => {
    try {
      const lessonData = await apiClient.getLesson(lessonId);
      setCurrentLesson(lessonData);
    } catch (err) {
      console.error('Error loading lesson:', err);
    }
  };

  const loadQuiz = async (lessonId: string) => {
    try {
      const quizData = await apiClient.getQuizByLesson(lessonId);
      setQuiz(quizData);
      setQuizMode('results'); // Default to results view
    } catch (err) {
      console.error('Error loading quiz:', err);
      setQuiz(null);
    }
  };

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setQuizMode('results');
    // Optionally mark lesson as complete if passed
    if (attempt.passed && enrollment) {
      apiClient.completeLesson(currentLesson!.id, enrollment.id).catch(console.error);
    }
  };

  const handleStartQuiz = () => {
    setQuizMode('play');
  };

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    router.push(`/courses/${courseId}/learn?lesson=${lesson.id}`, { scroll: false });
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson || !enrollment) return;

    try {
      await apiClient.completeLesson(currentLesson.id, enrollment.id);
      alert('Lição concluída!');
      loadCourseData(); // Refresh to update progress
    } catch (err) {
      alert('Erro ao completar lição: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson || modules.length === 0) return;

    // Find current lesson position
    let found = false;
    for (const courseModule of modules) {
      if (!courseModule.lessons) continue;

      for (let i = 0; i < courseModule.lessons.length; i++) {
        if (found) {
          handleLessonClick(courseModule.lessons[i]);
          return;
        }
        if (courseModule.lessons[i].id === currentLesson.id) {
          if (i < courseModule.lessons.length - 1) {
            handleLessonClick(courseModule.lessons[i + 1]);
            return;
          }
          found = true;
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-gray-100 border-r overflow-y-auto">
          <div className="p-4 border-b bg-white">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-6 w-full mb-3" />
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-5 w-48 mb-2" />
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-10 w-96 mb-4" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-6" />
              <Skeleton className="h-8 w-24 mb-6" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
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

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl mb-4">Você não está matriculado neste curso</div>
        <button
          onClick={() => router.push(`/courses/${courseId}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Ver Curso
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Modules & Lessons */}
      <div className="w-80 bg-gray-100 border-r overflow-y-auto">
        <div className="p-4 border-b bg-white">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:underline text-sm mb-2"
          >
            ← Voltar ao Dashboard
          </button>
          <h2 className="font-bold text-lg line-clamp-2">{course?.title}</h2>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${enrollment.progress || 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {enrollment.progress || 0}% concluído
          </p>
        </div>

        <div className="p-4 space-y-4">
          {modules.map((module, moduleIndex) => (
            <div key={module.id}>
              <h3 className="font-semibold mb-2">
                Módulo {moduleIndex + 1}: {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.map((lesson: Lesson, lessonIndex: number) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        currentLesson?.id === lesson.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {lessonIndex + 1}.
                        </span>
                        <span className="flex-1 line-clamp-2">{lesson.title}</span>
                        <span className="text-xs opacity-75">
                          {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm pl-2">Sem lições</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Lesson Player */}
      <div className="flex-1 flex flex-col">
        {currentLesson ? (
          <>
            {/* Lesson Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-4">{currentLesson.title}</h1>

                {currentLesson.description && (
                  <p className="text-gray-600 mb-6">{currentLesson.description}</p>
                )}

                {/* Content Type Badge */}
                <div className="mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {currentLesson.contentType}
                  </span>
                </div>

                {/* Content Rendering */}
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  {currentLesson.contentType === LessonContentType.VIDEO && (
                    <AdvancedVideoPlayer
                      src={currentLesson.content?.videoUrl || ''}
                      title={currentLesson.title}
                      videoId={`lesson-${currentLesson.id}`}
                      onComplete={() => {
                        // Marcar lição como concluída
                        if (enrollment) {
                          apiClient.markLessonAsCompleted(enrollment.id, currentLesson.id);
                        }
                      }}
                      className="w-full"
                    />
                  )}

                  {currentLesson.contentType === LessonContentType.TEXT && (
                    <div className="prose max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentLesson.content?.textContent || '<p>Conteúdo não disponível</p>',
                        }}
                      />
                    </div>
                  )}

                  {currentLesson.contentType === LessonContentType.PDF && (
                    <AdvancedPDFViewer
                      src={currentLesson.content?.pdfUrl || ''}
                      title={currentLesson.title}
                      pdfId={`lesson-${currentLesson.id}`}
                      onComplete={() => {
                        // Marcar lição como concluída
                        if (enrollment) {
                          apiClient.markLessonAsCompleted(enrollment.id, currentLesson.id);
                        }
                      }}
                      className="w-full h-96"
                    />
                  )}

                  {currentLesson.contentType === LessonContentType.QUIZ && quiz && enrollment && (
                    <div>
                      {quizMode === 'play' ? (
                        <QuizPlayer
                          quizId={quiz.id}
                          enrollmentId={enrollment.id}
                          onComplete={handleQuizComplete}
                        />
                      ) : (
                        <QuizResults
                          quizId={quiz.id}
                          onRetake={handleStartQuiz}
                        />
                      )}
                    </div>
                  )}

                  {currentLesson.contentType === LessonContentType.QUIZ && !quiz && (
                    <div className="text-center py-12">
                      <p className="mb-4">📝 Quiz</p>
                      <p className="text-gray-600">Nenhum quiz encontrado para esta lição</p>
                    </div>
                  )}

                  {currentLesson.contentType === LessonContentType.EXTERNAL && (
                    <div className="text-center py-12">
                      <p className="mb-4">🔗 Link Externo</p>
                      <a
                        href={currentLesson.content?.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Abrir Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t bg-white p-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <button
                  onClick={handleCompleteLesson}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  ✓ Marcar como Concluída
                </button>
                <button
                  onClick={handleNextLesson}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Próxima Lição →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="mb-4">Selecione uma lição para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
