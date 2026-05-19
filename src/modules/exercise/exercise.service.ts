import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { User } from '../user/entities/user.entity';
import { FetchExercisesDto } from './dto/fetch-exercises.dto';
import { GenerateAudioDto } from './dto/generate-audio.dto';
import { GenerateExerciseDto } from './dto/generate-exercise.dto';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { Exercise } from './entities/exercise.entity';
import { TTSEntry } from './entities/tts-entry.entity';
import { UserProgress } from './entities/user-progress.entity';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TTSEntry)
    private ttsEntryRepository: Repository<TTSEntry>,
    private aiService: AiService
  ) {}

  async fetchExercises(userId: string, dto: FetchExercisesDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = dto;
    const skip = (page - 1) * limit;

    // Map snake_case to camelCase for TypeORM entity properties
    const sortByMap: Record<string, string> = {
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'deleted_at': 'deletedAt',
      'source_language': 'sourceLanguage',
      'target_language': 'targetLanguage',
      'exercise_type': 'exerciseType',
      'unit_id': 'unitId',
      'original_question': 'originalQuestion',
      'original_options': 'originalOptions',
      'correct_answer': 'correctAnswer',
      'sarvam_generated_json': 'sarvamGeneratedJson'
    };
    const mappedSortBy = sortByMap[sortBy] || sortBy;

    const where: FindOptionsWhere<Exercise> = {
      sourceLanguage: user.currentLanguage,
      targetLanguage: user.targetLanguage,
      status: 'processed'
    };

    const [exercises, total] = await this.exerciseRepository.findAndCount({
      where,
      relations: ['userProgress', 'translations', 'transliterations', 'ttsEntries'],
      order: { [mappedSortBy]: sortOrder },
      skip,
      take: limit
    });

    // Filter user progress for current user
    exercises.forEach(exercise => {
      exercise.userProgress = exercise.userProgress?.filter(
        progress => progress.userId === userId
      ) || [];
    });

    return {
      exercises,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async submitExercise(userId: string, dto: SubmitExerciseDto) {
    const { exerciseId, answer, responseTime, hintUsed = false, audioPlayed = false } = dto;

    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId }
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if answer is correct
    const isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

    // Handle hearts system
    let heartUsed = false;
    if (!isCorrect) {
      const heartUsedSuccessfully = await user.useHeart();
      heartUsed = heartUsedSuccessfully;

      if (!heartUsedSuccessfully) {
        throw new BadRequestException({
          message: 'No hearts remaining',
          heartsRemaining: user.hearts
        });
      }
      await this.userRepository.save(user);
    }

    // Find or create user progress
    let userProgress = await this.userProgressRepository.findOne({
      where: { userId, exerciseId }
    });

    if (!userProgress) {
      userProgress = this.userProgressRepository.create({
        userId,
        exerciseId,
        attempts: 0,
        correct: false
      });
    }

    // Record the attempt
    userProgress.attempts += 1;
    userProgress.correct = isCorrect;
    userProgress.lastAnswer = answer;
    userProgress.responseTimeMs = responseTime;
    userProgress.needsRetry = !isCorrect;
    if (hintUsed) userProgress.hintUsed = true;
    if (audioPlayed) userProgress.audioPlayed = true;

    await this.userProgressRepository.save(userProgress);

    // Update user streak
    if (isCorrect) {
      user.streak += 1;
    } else if (userProgress.attempts === 1) {
      // Only reset streak on first wrong attempt
      user.streak = 0;
    }
    await this.userRepository.save(user);

    // Prepare response
    const response: any = {
      correct: isCorrect,
      attempts: userProgress.attempts,
      explanation: isCorrect ? null : exercise.explanation,
      correctAnswer: isCorrect ? null : exercise.correctAnswer,
      heartUsed,
      heartsRemaining: user.hearts,
      streak: user.streak
    };

    // If incorrect and user has hearts, allow retry
    if (!isCorrect && user.hearts > 0) {
      response.canRetry = true;
      response.hint = exercise.hint;
    }

    return response;
  }

  async generateExercises(userId: string, dto: GenerateExerciseDto) {
    const { sourceLanguage, targetLanguage, difficulty, exerciseType, unitId, count = 1 } = dto;

    try {
      // Call AI service to generate exercises
      const generatedExercises = await this.aiService.generateExercises({
        sourceLanguage,
        targetLanguage,
        difficulty,
        exerciseType,
        unitId,
        count
      });

      // Create exercise records in database
      const exercises = [];
      for (const exerciseData of generatedExercises) {
        const exercise = this.exerciseRepository.create({
          unitId,
          sourceLanguage,
          targetLanguage,
          difficulty,
          exerciseType,
          originalQuestion: exerciseData.original_question || exerciseData.question,
          originalOptions: exerciseData.answer_options || exerciseData.options,
          correctAnswer: exerciseData.correct_answer || exerciseData.correctAnswer,
          hint: exerciseData.hint,
          explanation: exerciseData.explanation,
          sarvamGeneratedJson: exerciseData,
          status: 'pending'
        });

        const savedExercise = await this.exerciseRepository.save(exercise);
        exercises.push(savedExercise);

        // TODO: Queue background processing for translations, transliterations, and TTS
        // await this.exerciseQueue.add('processExercise', { ... });
      }

      return {
        message: `${exercises.length} exercises generated successfully`,
        exercises,
        processingStatus: 'Translations and audio generation queued'
      };
    } catch (error) {
      console.error('Exercise generation error:', error);
      throw new InternalServerErrorException({
        message: 'Failed to generate exercises',
        details: error.message
      });
    }
  }

  async generateAudio(exerciseId: string, dto: GenerateAudioDto) {
    const { text, language } = dto;

    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId }
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    try {
      // Call AI service to generate TTS
      const ttsResult = await this.aiService.generateTTS({
        text,
        language
      });

      // Create TTS entry
      const ttsEntry = this.ttsEntryRepository.create({
        exerciseId,
        text,
        language,
        audioUrl: ttsResult.audio_url || ttsResult.audioUrl,
        durationMs: ttsResult.duration_ms || ttsResult.durationMs,
        codec: ttsResult.codec || 'mp3'
      });

      const savedTtsEntry = await this.ttsEntryRepository.save(ttsEntry);

      return {
        message: 'Audio generated successfully',
        audio: {
          url: savedTtsEntry.audioUrl,
          duration: savedTtsEntry.durationMs,
          codec: savedTtsEntry.codec
        }
      };
    } catch (error) {
      console.error('Audio generation error:', error);
      throw new InternalServerErrorException({
        message: 'Failed to generate audio',
        details: error.message
      });
    }
  }

  async getExercise(exerciseId: string, userId: string) {
    const exercise = await this.exerciseRepository.findOne({
      where: { id: exerciseId },
      relations: ['userProgress', 'translations', 'transliterations', 'ttsEntries']
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Filter user progress for current user
    exercise.userProgress = exercise.userProgress?.filter(
      progress => progress.userId === userId
    ) || [];

    return { exercise };
  }
}
