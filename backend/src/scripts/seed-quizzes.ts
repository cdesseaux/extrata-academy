import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Lesson } from '../lessons/entities/lesson.entity';
import { LessonContentType } from '../lessons/entities/lesson.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Question, } from '../quizzes/entities/question.entity';

async function seedQuizzes() {
	const app = await NestFactory.createApplicationContext(AppModule);
	const dataSource = app.get(DataSource);

	const lessonRepo = dataSource.getRepository(Lesson);
	const quizRepo = dataSource.getRepository(Quiz);
	const questionRepo = dataSource.getRepository(Question);

	console.log('🌱 Iniciando seed de quizzes...');

	// Seleciona até 2 lições do tipo QUIZ ou cria uma se não existir
	let quizLessons = await lessonRepo.find({ where: { contentType: LessonContentType.QUIZ }, take: 2 });

	if (quizLessons.length === 0) {
		// Cria uma lição de quiz básica ligada ao primeiro módulo disponível
		const anyLesson = await lessonRepo.find({ take: 1 });
		if (anyLesson.length === 0) {
			console.log('⚠️ Nenhuma lição encontrada. Crie cursos/módulos/lições antes de semear quizzes.');
			await app.close();
			return;
		}

		const baseLesson = anyLesson[0];
		const newQuizLesson = lessonRepo.create({
			moduleId: baseLesson.moduleId,
			title: 'Quiz: Conhecimentos Iniciais',
			description: 'Teste seus conhecimentos básicos',
			contentType: LessonContentType.QUIZ,
			order: baseLesson.order + 1,
			duration: 900,
			isActive: true,
			content: {},
		});
		await lessonRepo.save(newQuizLesson);
		quizLessons = [newQuizLesson];
		console.log('✓ Criada lição de quiz padrão');
	}

	for (const lesson of quizLessons) {
		let quiz = await quizRepo.findOne({ where: { lessonId: lesson.id } });
		if (!quiz) {
			quiz = quizRepo.create({
				lessonId: lesson.id,
				title: `Avaliação da Lição: ${lesson.title}`,
				description: 'Responda às questões para avançar',
				passingScore: 70,
				timeLimit: 15,
				showCorrectAnswers: true,
				maxAttempts: 3,
				isActive: true,
			});
			quiz = await quizRepo.save(quiz);
			console.log(`✓ Quiz criado para lição ${lesson.title}`);
		} else {
			console.log(`⏭️ Quiz já existe para lição ${lesson.title}`);
		}

		const existingQuestions = await questionRepo.find({ where: { quizId: quiz.id } });
		if (existingQuestions.length === 0) {
			const questions = [
				questionRepo.create({
					quizId: quiz.id,
					question: 'O que é o Extrata Academy?',
					type: 'multiple_choice' as any,
					options: [
						{ id: 'A', text: 'Um sistema de gestão de cursos (LMS)' },
						{ id: 'B', text: 'Um editor de texto' },
						{ id: 'C', text: 'Um sistema de pagamentos' },
					],
					correctAnswers: ['A'],
					points: 2,
					order: 0,
				}),
				questionRepo.create({
					quizId: quiz.id,
					question: 'Quais tipos de conteúdo uma lição pode ter?',
					type: 'multiple_choice' as any,
					options: [
						{ id: 'A', text: 'VIDEO, TEXT, PDF, QUIZ, EXTERNAL' },
						{ id: 'B', text: 'Apenas VIDEO' },
						{ id: 'C', text: 'Apenas TEXT e PDF' },
					],
					correctAnswers: ['A'],
					points: 3,
					order: 1,
				}),
				questionRepo.create({
					quizId: quiz.id,
					question: 'V/F: É possível limitar o número de tentativas de um quiz.',
					type: 'true_false' as any,
					options: [
						{ id: 'true', text: 'Verdadeiro' },
						{ id: 'false', text: 'Falso' },
					],
					correctAnswers: ['true'],
					points: 1,
					order: 2,
				}),
			];

			await questionRepo.save(questions);
			console.log(`✓ ${questions.length} questões criadas para o quiz`);
		} else {
			console.log(`⏭️ ${existingQuestions.length} questões já existem para esta lição`);
		}
	}

	console.log('🎉 Seed de quizzes concluído!');
	await app.close();
}

seedQuizzes().catch((err) => {
	console.error('Erro no seed de quizzes:', err);
	process.exit(1);
});


