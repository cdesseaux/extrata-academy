import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheService } from '../common/services/cache.service';

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo quiz' })
  @ApiResponse({ status: 201, description: 'Quiz criado com sucesso' })
  async create(@Body() createQuizDto: CreateQuizDto) {
    const quiz = await this.quizzesService.create(createQuizDto);

    // Invalidate quiz caches
    await this.cacheService.delByPattern('http:/api/quizzes?*');
    if (createQuizDto.lessonId) {
      await this.cacheService.delByPattern(`http:/api/quizzes/lesson/${createQuizDto.lessonId}*`);
    }

    return quiz;
  }

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @ApiOperation({ summary: 'Listar todos os quizzes' })
  @ApiResponse({ status: 200, description: 'Lista de quizzes' })
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  @UseInterceptors(HttpCacheInterceptor)
  @ApiOperation({ summary: 'Buscar quiz por ID' })
  @ApiResponse({ status: 200, description: 'Quiz encontrado' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Get('lesson/:lessonId')
  @UseInterceptors(HttpCacheInterceptor)
  @ApiOperation({ summary: 'Buscar quiz por lição' })
  @ApiResponse({ status: 200, description: 'Quiz da lição encontrado' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado para esta lição' })
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLesson(lessonId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar quiz' })
  @ApiResponse({ status: 200, description: 'Quiz atualizado com sucesso' })
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    const quiz = await this.quizzesService.update(id, updateQuizDto);

    // Invalidate quiz caches
    await this.cacheService.del(`http:/api/quizzes/${id}`);
    await this.cacheService.delByPattern('http:/api/quizzes?*');
    if (quiz.lessonId) {
      await this.cacheService.delByPattern(`http:/api/quizzes/lesson/${quiz.lessonId}*`);
    }

    return quiz;
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover quiz' })
  @ApiResponse({ status: 204, description: 'Quiz removido com sucesso' })
  async remove(@Param('id') id: string) {
    const quiz = await this.quizzesService.findOne(id);
    const result = await this.quizzesService.remove(id);

    // Invalidate quiz caches
    await this.cacheService.del(`http:/api/quizzes/${id}`);
    await this.cacheService.delByPattern('http:/api/quizzes?*');
    if (quiz?.lessonId) {
      await this.cacheService.delByPattern(`http:/api/quizzes/lesson/${quiz.lessonId}*`);
    }

    return result;
  }

  // Question endpoints
  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar questão ao quiz' })
  @ApiResponse({ status: 201, description: 'Questão adicionada com sucesso' })
  async addQuestion(@Param('id') quizId: string, @Body() createQuestionDto: CreateQuestionDto) {
    const question = await this.quizzesService.addQuestion(quizId, createQuestionDto);

    // Invalidate quiz caches (questions changed)
    await this.cacheService.del(`http:/api/quizzes/${quizId}`);
    await this.cacheService.delByPattern('http:/api/quizzes?*');

    return question;
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar questão' })
  @ApiResponse({ status: 200, description: 'Questão atualizada com sucesso' })
  async updateQuestion(@Param('questionId') questionId: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    const question = await this.quizzesService.updateQuestion(questionId, updateQuestionDto);

    // Invalidate quiz caches (question content changed)
    if (question.quizId) {
      await this.cacheService.del(`http:/api/quizzes/${question.quizId}`);
    }
    await this.cacheService.delByPattern('http:/api/quizzes?*');

    return question;
  }

  @Delete('questions/:questionId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover questão' })
  @ApiResponse({ status: 204, description: 'Questão removida com sucesso' })
  async deleteQuestion(@Param('questionId') questionId: string) {
    const result = await this.quizzesService.deleteQuestion(questionId);

    // Invalidate quiz caches (question removed)
    await this.cacheService.delByPattern('http:/api/quizzes?*');

    return result;
  }

  @Post(':id/questions/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar questões do quiz' })
  @ApiResponse({ status: 200, description: 'Questões reordenadas com sucesso' })
  async reorderQuestions(@Param('id') quizId: string, @Body() reorderDto: ReorderQuestionsDto) {
    const result = await this.quizzesService.reorderQuestions(quizId, reorderDto);

    // Invalidate quiz caches (question order changed)
    await this.cacheService.del(`http:/api/quizzes/${quizId}`);
    await this.cacheService.delByPattern('http:/api/quizzes?*');

    return result;
  }

  // Quiz Attempt endpoints
  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Iniciar tentativa de quiz' })
  @ApiResponse({ status: 201, description: 'Tentativa iniciada com sucesso' })
  startAttempt(@Param('id') quizId: string, @Request() req: any) {
    const userId = req.user.sub;
    const enrollmentId = req.body.enrollmentId; // Assumindo que será enviado no body

    if (!enrollmentId) {
      throw new Error('enrollmentId é obrigatório');
    }

    // Don't cache quiz attempts - they're dynamic
    return this.quizzesService.startAttempt(quizId, userId, enrollmentId);
  }

  @Post('attempts/:attemptId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalizar tentativa de quiz' })
  @ApiResponse({ status: 200, description: 'Quiz finalizado com sucesso' })
  async submitQuiz(@Param('attemptId') attemptId: string, @Body() submitQuizDto: SubmitQuizDto, @Request() req: any) {
    const result = await this.quizzesService.submitQuiz(attemptId, submitQuizDto);

    // Invalidate attempt-related caches
    await this.cacheService.delByPattern(`http:/api/quizzes/*/my-attempts*user:${req.user.sub}*`);
    await this.cacheService.delByPattern(`http:/api/quizzes/*/can-retake*user:${req.user.sub}*`);
    await this.cacheService.delByPattern(`http:/api/quizzes/*/best-attempt*user:${req.user.sub}*`);

    return result;
  }

  @Get('attempts/:attemptId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar tentativa por ID' })
  @ApiResponse({ status: 200, description: 'Tentativa encontrada' })
  getAttempt(@Param('attemptId') attemptId: string) {
    // Implementar método no service se necessário
    return { message: 'Implementar getAttempt no service' };
  }

  @Get(':id/my-attempts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar minhas tentativas do quiz' })
  @ApiResponse({ status: 200, description: 'Lista de tentativas do usuário' })
  getMyAttempts(@Param('id') quizId: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.quizzesService.getAttempts(userId, quizId);
  }

  @Get(':id/can-retake')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar se pode tentar novamente' })
  @ApiResponse({ status: 200, description: 'Status de retry' })
  canRetake(@Param('id') quizId: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.quizzesService.canRetake(userId, quizId);
  }

  @Get(':id/best-attempt')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar melhor tentativa do usuário' })
  @ApiResponse({ status: 200, description: 'Melhor tentativa encontrada' })
  getBestAttempt(@Param('id') quizId: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.quizzesService.getBestAttempt(userId, quizId);
  }
}