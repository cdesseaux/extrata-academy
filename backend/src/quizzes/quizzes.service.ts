import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, Question, QuizAttempt } from './entities';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
  ) {}

  // Quiz CRUD
  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quiz = this.quizRepository.create(createQuizDto);
    return this.quizRepository.save(quiz);
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizRepository.find({
      relations: ['lesson', 'questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['lesson', 'questions'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz com ID ${id} não encontrado`);
    }

    return quiz;
  }

  async findByLesson(lessonId: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { lessonId, isActive: true },
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz para lição ${lessonId} não encontrado`);
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id);
    Object.assign(quiz, updateQuizDto);
    return this.quizRepository.save(quiz);
  }

  async remove(id: string): Promise<void> {
    const quiz = await this.findOne(id);
    quiz.isActive = false;
    await this.quizRepository.save(quiz);
  }

  // Question CRUD
  async addQuestion(quizId: string, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const quiz = await this.findOne(quizId);
    
    const question = this.questionRepository.create({
      ...createQuestionDto,
      quizId,
    });

    return this.questionRepository.save(question);
  }

  async updateQuestion(questionId: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Questão com ID ${questionId} não encontrada`);
    }

    Object.assign(question, updateQuestionDto);
    return this.questionRepository.save(question);
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Questão com ID ${questionId} não encontrada`);
    }

    question.isActive = false;
    await this.questionRepository.save(question);
  }

  async reorderQuestions(quizId: string, reorderDto: ReorderQuestionsDto): Promise<void> {
    const { questionIds } = reorderDto;

    for (let i = 0; i < questionIds.length; i++) {
      await this.questionRepository.update(
        { id: questionIds[i] },
        { order: i }
      );
    }
  }

  // Quiz Attempts
  async startAttempt(quizId: string, userId: string, enrollmentId: string): Promise<QuizAttempt> {
    const quiz = await this.findOne(quizId);
    
    // Verificar se pode tentar novamente
    const canRetake = await this.canRetake(userId, quizId);
    if (!canRetake) {
      throw new BadRequestException('Limite de tentativas excedido');
    }

    // Contar tentativas anteriores
    const previousAttempts = await this.quizAttemptRepository.count({
      where: { quizId, userId },
    });

    const attempt = this.quizAttemptRepository.create({
      quizId,
      userId,
      enrollmentId,
      attemptNumber: previousAttempts + 1,
      startedAt: new Date(),
      answers: [],
      score: 0,
      passed: false,
    });

    return this.quizAttemptRepository.save(attempt);
  }

  async submitQuiz(attemptId: string, submitQuizDto: SubmitQuizDto): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptRepository.findOne({
      where: { id: attemptId },
      relations: ['quiz', 'quiz.questions'],
    });

    if (!attempt) {
      throw new NotFoundException(`Tentativa com ID ${attemptId} não encontrada`);
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz já foi finalizado');
    }

    // Salvar respostas
    attempt.answers = submitQuizDto.answers;
    attempt.completedAt = new Date();

    // Corrigir quiz
    const gradedAttempt = await this.gradeQuiz(attempt);

    return this.quizAttemptRepository.save(gradedAttempt);
  }

  async gradeQuiz(attempt: QuizAttempt): Promise<QuizAttempt> {
    const { answers, quiz } = attempt;
    const questions = quiz.questions;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    const feedback = [];

    for (const question of questions) {
      totalPoints += question.points;
      
      const userAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = this.checkAnswer(question, userAnswer?.answer || []);
      
      if (isCorrect) {
        earnedPoints += question.points;
      }

      feedback.push({
        questionId: question.id,
        isCorrect,
        userAnswer: userAnswer?.answer || [],
        correctAnswer: question.correctAnswers,
        explanation: question.explanation,
      });
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    attempt.score = score;
    attempt.passed = passed;
    attempt.feedback = feedback;

    return attempt;
  }

  private checkAnswer(question: Question, userAnswer: string[]): boolean {
    const correctAnswers = question.correctAnswers.sort();
    const sortedUserAnswer = userAnswer.sort();
    
    return JSON.stringify(correctAnswers) === JSON.stringify(sortedUserAnswer);
  }

  async getAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return this.quizAttemptRepository.find({
      where: { userId, quizId },
      relations: ['quiz'],
      order: { attemptNumber: 'DESC' },
    });
  }

  async canRetake(userId: string, quizId: string): Promise<boolean> {
    const quiz = await this.findOne(quizId);
    const attempts = await this.quizAttemptRepository.count({
      where: { userId, quizId },
    });

    return quiz.maxAttempts === 0 || attempts < quiz.maxAttempts;
  }

  async getBestAttempt(userId: string, quizId: string): Promise<QuizAttempt | null> {
    const attempts = await this.quizAttemptRepository.find({
      where: { userId, quizId },
      order: { score: 'DESC' },
      take: 1,
    });

    return attempts.length > 0 ? attempts[0] : null;
  }
}