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

@ApiTags('Quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo quiz' })
  @ApiResponse({ status: 201, description: 'Quiz criado com sucesso' })
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os quizzes' })
  @ApiResponse({ status: 200, description: 'Lista de quizzes' })
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar quiz por ID' })
  @ApiResponse({ status: 200, description: 'Quiz encontrado' })
  @ApiResponse({ status: 404, description: 'Quiz não encontrado' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Get('lesson/:lessonId')
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
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover quiz' })
  @ApiResponse({ status: 204, description: 'Quiz removido com sucesso' })
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }

  // Question endpoints
  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adicionar questão ao quiz' })
  @ApiResponse({ status: 201, description: 'Questão adicionada com sucesso' })
  addQuestion(@Param('id') quizId: string, @Body() createQuestionDto: CreateQuestionDto) {
    return this.quizzesService.addQuestion(quizId, createQuestionDto);
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar questão' })
  @ApiResponse({ status: 200, description: 'Questão atualizada com sucesso' })
  updateQuestion(@Param('questionId') questionId: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.quizzesService.updateQuestion(questionId, updateQuestionDto);
  }

  @Delete('questions/:questionId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover questão' })
  @ApiResponse({ status: 204, description: 'Questão removida com sucesso' })
  deleteQuestion(@Param('questionId') questionId: string) {
    return this.quizzesService.deleteQuestion(questionId);
  }

  @Post(':id/questions/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar questões do quiz' })
  @ApiResponse({ status: 200, description: 'Questões reordenadas com sucesso' })
  reorderQuestions(@Param('id') quizId: string, @Body() reorderDto: ReorderQuestionsDto) {
    return this.quizzesService.reorderQuestions(quizId, reorderDto);
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
    
    return this.quizzesService.startAttempt(quizId, userId, enrollmentId);
  }

  @Post('attempts/:attemptId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalizar tentativa de quiz' })
  @ApiResponse({ status: 200, description: 'Quiz finalizado com sucesso' })
  submitQuiz(@Param('attemptId') attemptId: string, @Body() submitQuizDto: SubmitQuizDto) {
    return this.quizzesService.submitQuiz(attemptId, submitQuizDto);
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar minhas tentativas do quiz' })
  @ApiResponse({ status: 200, description: 'Lista de tentativas do usuário' })
  getMyAttempts(@Param('id') quizId: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.quizzesService.getAttempts(userId, quizId);
  }

  @Get(':id/can-retake')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar se pode tentar novamente' })
  @ApiResponse({ status: 200, description: 'Status de retry' })
  canRetake(@Param('id') quizId: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.quizzesService.canRetake(userId, quizId);
  }

  @Get(':id/best-attempt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar melhor tentativa do usuário' })
  @ApiResponse({ status: 200, description: 'Melhor tentativa encontrada' })
  getBestAttempt(@Param('id') quizId: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.quizzesService.getBestAttempt(userId, quizId);
  }
}