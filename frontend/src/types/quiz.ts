export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  ESSAY = 'essay',
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswers: string[];
  points: number;
  order: number;
  explanation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit: number; // em minutos
  showCorrectAnswers: boolean;
  maxAttempts: number;
  isActive: boolean;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  enrollmentId: string;
  answers: Array<{
    questionId: string;
    answer: string[];
  }>;
  score: number;
  passed: boolean;
  startedAt?: string;
  completedAt?: string;
  attemptNumber: number;
  feedback?: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: string[];
    correctAnswer: string[];
    explanation?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// DTOs para criação
export interface CreateQuizDto {
  lessonId: string;
  title: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
  showCorrectAnswers?: boolean;
  maxAttempts?: number;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
  showCorrectAnswers?: boolean;
  maxAttempts?: number;
}

export interface CreateQuestionDto {
  quizId: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswers: string[];
  points?: number;
  order?: number;
  explanation?: string;
}

export interface UpdateQuestionDto {
  question?: string;
  type?: QuestionType;
  options?: QuestionOption[];
  correctAnswers?: string[];
  points?: number;
  order?: number;
  explanation?: string;
}

export interface SubmitQuizDto {
  answers: Array<{
    questionId: string;
    answer: string[];
  }>;
}

export interface ReorderQuestionsDto {
  questionIds: string[];
}