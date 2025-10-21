// Use environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Debug: Log the API URL being used (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 API_BASE_URL:', API_BASE_URL);
  console.log('🔍 NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('keycloak-token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Debug: Log the constructed URL
    console.log('🔍 API Request URL:', url);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Sempre tenta obter o token mais recente do localStorage
    const currentToken = this.token || this.getTokenFromStorage();

    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    } else {
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido
        this.token = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('keycloak-token');
        }
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Verifica se há conteúdo na resposta antes de tentar parsear JSON
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // Se não há content-type de JSON ou content-length é 0, retorna null
    if (!contentType?.includes('application/json') || contentLength === '0') {
      return null as T;
    }

    // Tenta parsear JSON, mas retorna null se falhar
    try {
      return await response.json();
    } catch (error) {
      return null as T;
    }
  }

  // Auth endpoints
  async getProfile() {
    return this.request('/auth/profile');
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  // Course endpoints
  async getCourses() {
    return this.request('/courses');
  }

  async getCourse(id: string) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: Record<string, unknown>) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: Record<string, unknown>) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Enrollment endpoints
  async getEnrollments() {
    return this.request('/enrollments');
  }

  async getMyEnrollments() {
    return this.request('/enrollments/my-enrollments');
  }

  async getEnrollment(id: string) {
    return this.request(`/enrollments/${id}`);
  }

  async enrollInCourse(courseId: string) {
    return this.request('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }


  async unenrollFromCourse(id: string) {
    return this.request(`/enrollments/${id}`, {
      method: 'DELETE',
    });
  }

  // Module endpoints
  async getModules() {
    return this.request('/modules');
  }

  async getModule(id: string) {
    return this.request(`/modules/${id}`);
  }

  async getModulesByCourse(courseId: string) {
    return this.request(`/modules/course/${courseId}`);
  }

  async createModule(moduleData: Record<string, unknown>) {
    return this.request('/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  }

  async updateModule(id: string, moduleData: Record<string, unknown>) {
    return this.request(`/modules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(moduleData),
    });
  }

  async deleteModule(id: string) {
    return this.request(`/modules/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderModules(courseId: string, moduleIds: string[]) {
    return this.request(`/modules/course/${courseId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ moduleIds }),
    });
  }

  async duplicateModule(id: string) {
    return this.request(`/modules/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async updateModuleDuration(id: string) {
    return this.request(`/modules/${id}/update-duration`, {
      method: 'PATCH',
    });
  }

  // Lesson endpoints
  async getLessons() {
    return this.request('/lessons');
  }

  async getLesson(id: string) {
    return this.request(`/lessons/${id}`);
  }

  async getLessonsByModule(moduleId: string) {
    return this.request(`/lessons/module/${moduleId}`);
  }

  async createLesson(lessonData: Record<string, unknown>) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(id: string, lessonData: Record<string, unknown>) {
    return this.request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(id: string) {
    return this.request(`/lessons/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderLessons(moduleId: string, lessonIds: string[]) {
    return this.request(`/lessons/module/${moduleId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ lessonIds }),
    });
  }

  async completeLesson(id: string, enrollmentId: string, watchTime?: number) {
    return this.request(`/lessons/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ enrollmentId, watchTime }),
    });
  }

  async updateWatchTime(id: string, enrollmentId: string, watchTime: number, lastPosition: number) {
    return this.request(`/lessons/${id}/watch-time`, {
      method: 'POST',
      body: JSON.stringify({ enrollmentId, watchTime, lastPosition }),
    });
  }

  async getLessonProgress(enrollmentId: string) {
    return this.request(`/lessons/enrollment/${enrollmentId}/progress`);
  }

  async getMyProgress() {
    return this.request('/lessons/user/my-progress');
  }

  async getNextLesson(id: string) {
    return this.request(`/lessons/${id}/next`);
  }

  async getPreviousLesson(id: string) {
    return this.request(`/lessons/${id}/previous`);
  }

  // Quiz endpoints
  async getQuizzes() {
    return this.request('/quizzes');
  }

  async getQuiz(id: string) {
    return this.request(`/quizzes/${id}`);
  }

  async getQuizByLesson(lessonId: string) {
    return this.request(`/quizzes/lesson/${lessonId}`);
  }

  async createQuiz(quizData: Record<string, unknown>) {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async updateQuiz(id: string, quizData: Record<string, unknown>) {
    return this.request(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(id: string) {
    return this.request(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  }

  // Question endpoints
  async addQuestion(questionData: Record<string, unknown>) {
    const { quizId, ...data } = questionData;
    return this.request(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(id: string, questionData: Record<string, unknown>) {
    return this.request(`/quizzes/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`/quizzes/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderQuestions(quizId: string, questionIds: string[]) {
    return this.request(`/quizzes/${quizId}/questions/reorder`, {
      method: 'POST',
      body: JSON.stringify({ questionIds }),
    });
  }

  // Quiz attempt endpoints
  async startQuizAttempt(quizId: string, enrollmentId: string) {
    return this.request(`/quizzes/${quizId}/start`, {
      method: 'POST',
      body: JSON.stringify({ enrollmentId }),
    });
  }

  async submitAnswer(attemptId: string, questionId: string, answer: string[]) {
    return this.request(`/quizzes/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async submitQuiz(attemptId: string) {
    return this.request(`/quizzes/attempts/${attemptId}/submit`, {
      method: 'POST',
    });
  }

  async getQuizAttempt(attemptId: string) {
    return this.request(`/quizzes/attempts/${attemptId}`);
  }

  async getMyQuizAttempts(quizId: string) {
    return this.request(`/quizzes/${quizId}/my-attempts`);
  }

  async canRetakeQuiz(quizId: string) {
    return this.request(`/quizzes/${quizId}/can-retake`);
  }

  async getBestQuizAttempt(quizId: string) {
    return this.request(`/quizzes/${quizId}/best-attempt`);
  }

  // Learning Paths endpoints
  async getLearningPaths() {
    return this.request('/learning-paths');
  }

  async getLearningPath(id: string) {
    return this.request(`/learning-paths/${id}`);
  }

  async createLearningPath(data: Record<string, unknown>) {
    return this.request('/learning-paths', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLearningPath(id: string, data: Record<string, unknown>) {
    return this.request(`/learning-paths/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLearningPath(id: string) {
    return this.request(`/learning-paths/${id}`, {
      method: 'DELETE',
    });
  }

  async enrollInLearningPath(id: string) {
    return this.request(`/learning-paths/${id}/enroll`, {
      method: 'POST',
    });
  }

  async getMyLearningPathEnrollment(id: string) {
    return this.request(`/learning-paths/${id}/enrollment`);
  }

  async updateMyLearningPathProgress(id: string, progressPercentage: number) {
    return this.request(`/learning-paths/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progressPercentage }),
    });
  }

  // File upload endpoints
  async uploadFile(file: File, type: 'video' | 'pdf' | 'image' | 'thumbnail' | 'avatar' | 'document') {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.token || this.getTokenFromStorage();
    const response = await fetch(`${this.baseURL}/files/upload/${type}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async getFiles() {
    return this.request('/files');
  }

  async getFile(id: string) {
    return this.request(`/files/${id}`);
  }

  async deleteFile(id: string) {
    return this.request(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  async getFilePresignedUrl(id: string): Promise<{ url: string; expiresIn: number }> {
    return this.request(`/files/${id}/url`);
  }

  // Certificate endpoints
  async getMyCertificates(): Promise<unknown[]> {
    return this.request<unknown[]>('/certificates/my-certificates');
  }

  async getCertificate(id: string) {
    return this.request(`/certificates/${id}`);
  }

  async validateCertificate(certificateNumber: string) {
    return this.request(`/certificates/validate/${certificateNumber}`);
  }

  async downloadCertificate(certificateNumber: string) {
    return this.request(`/certificates/download/${certificateNumber}`);
  }

  async generateCertificate(courseId: string, completionDate?: string) {
    return this.request('/certificates/generate', {
      method: 'POST',
      body: JSON.stringify({ courseId, completionDate }),
    });
  }

  // Gamification endpoints
  async getUserXP() {
    return this.request('/gamification/xp');
  }

  async getUserAchievements() {
    return this.request('/gamification/achievements');
  }

  async getLeaderboard() {
    return this.request('/gamification/leaderboard');
  }

  async getXPHistory() {
    return this.request('/gamification/xp-history');
  }

  async addXP(amount: number, type: string, description?: string, metadata?: Record<string, unknown>) {
    return this.request('/gamification/add-xp', {
      method: 'POST',
      body: JSON.stringify({ amount, type, description, metadata }),
    });
  }

  async updateStreak() {
    return this.request('/gamification/update-streak', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

