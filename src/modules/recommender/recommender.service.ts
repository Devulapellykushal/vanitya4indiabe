import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { UserProgress } from '../exercise/entities/user-progress.entity';
import { RLState } from './entities/rl-state.entity';
import { NextExerciseDto } from './dto/next-exercise.dto';
import { FeedbackDto } from './dto/feedback.dto';

@Injectable()
export class RecommenderService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exerciseRepository: Repository<Exercise>,
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(RLState)
    private rlStateRepository: Repository<RLState>
  ) {}

  async getNextExercise(userId: string, dto: NextExerciseDto) {
    const { sourceLanguage, targetLanguage, excludeTypes = [] } = dto;

    // Get user and their RL state
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['rlState']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use provided languages or user's preferences
    const srcLang = sourceLanguage || user.currentLanguage;
    const tgtLang = targetLanguage || user.targetLanguage;

    // Get user's RL state or create one
    // Always fetch from repository to ensure we have a proper entity instance with methods
    let rlState = await this.rlStateRepository.findOne({
      where: { userId }
    });
    
    if (!rlState) {
      rlState = this.rlStateRepository.create({
        userId,
        modelState: {},
        lastUpdated: new Date()
      });
      rlState = await this.rlStateRepository.save(rlState);
    }

    // Get exercises that need retry first (highest priority)
    const retryExercises = await this.getRetriesNeeded(userId);

    if (retryExercises.length > 0) {
      const retryExercise = retryExercises[0];
      return {
        exercise: retryExercise.exercise,
        reason: 'retry',
        message: 'This exercise needs a retry based on previous incorrect attempts.',
        retryAttempt: retryExercise.attempts
      };
    }

    // Use RL algorithm to select next exercise type
    // Check if selectArm method exists (should always exist, but safety check)
    const selectedArm = rlState && typeof rlState.selectArm === 'function' 
      ? rlState.selectArm() 
      : null;

    if (!selectedArm) {
      // Fallback to basic recommendation
      return this.fallbackRecommendation(srcLang, tgtLang, excludeTypes, user);
    }

    // Parse the selected arm (format: "exerciseType_difficulty")
    const [exerciseType, difficulty] = selectedArm.split('_');

    // Skip if this type is excluded
    if (excludeTypes.includes(exerciseType)) {
      return this.fallbackRecommendation(srcLang, tgtLang, excludeTypes, user);
    }

    // Find exercises of the recommended type that user hasn't completed
    const completedExerciseIds = await this.userProgressRepository.find({
      where: { userId, correct: true },
      select: ['exerciseId']
    }).then(results => results.map(r => r.exerciseId));

    const where: any = {
      sourceLanguage: srcLang,
      targetLanguage: tgtLang,
      exerciseType,
      difficulty,
      status: 'processed'
    };

    if (completedExerciseIds.length > 0) {
      where.id = Not(In(completedExerciseIds));
    }

    const recommendedExercise = await this.exerciseRepository.findOne({
      where,
      relations: ['translations', 'ttsEntries'],
      order: { createdAt: 'ASC' }
    });

    if (!recommendedExercise) {
      // No exercises found for recommended type, fallback
      return this.fallbackRecommendation(srcLang, tgtLang, excludeTypes, user);
    }

    return {
      exercise: recommendedExercise,
      reason: 'rl_recommendation',
      message: 'Recommended based on RL algorithm.',
      selectedArm
    };
  }

  async recordFeedback(userId: string, dto: FeedbackDto) {
    const { exerciseId, exerciseType, difficulty, correct, responseTime } = dto;

    // Get user's RL state
    const rlState = await this.rlStateRepository.findOne({
      where: { userId }
    });

    if (!rlState) {
      throw new NotFoundException('RL state not found for user');
    }

    // Calculate reward based on correctness and response time
    let reward = correct ? 1 : 0;

    // Bonus for quick correct answers (under 10 seconds)
    if (correct && responseTime && responseTime < 10000) {
      reward += 0.2;
    }

    // Penalty for very slow answers (over 60 seconds)
    if (responseTime && responseTime > 60000) {
      reward -= 0.1;
    }

    // Ensure reward is between 0 and 1
    reward = Math.max(0, Math.min(1, reward));

    // Update RL state
    const arm = `${exerciseType}_${difficulty}`;
    // TODO: Implement updateArm method in RLState entity
    rlState.lastUpdated = new Date();
    await this.rlStateRepository.save(rlState);

    return {
      message: 'Feedback recorded successfully',
      arm,
      reward
    };
  }

  async getAnalytics(userId: string) {
    const rlState = await this.rlStateRepository.findOne({
      where: { userId }
    });

    if (!rlState) {
      throw new NotFoundException('RL state not found for user');
    }

    // Get user progress statistics
    const userStats = await this.getUserStats(userId);

    // Get recent progress
    const recentProgress = await this.userProgressRepository.find({
      where: { userId },
      relations: ['exercise'],
      order: { timestamp: 'DESC' } as any, // Using timestamp from database schema
      take: 10
    });

    return {
      rlState: {
        algorithm: 'epsilon-greedy', // TODO: Get from modelState
        totalPulls: 0, // TODO: Calculate from modelState
        epsilon: 0.1, // TODO: Get from modelState
        armStats: [] // TODO: Get from modelState
      },
      userStats,
      recentProgress: recentProgress.map(progress => ({
        exerciseType: progress.exercise?.exerciseType,
        difficulty: progress.exercise?.difficulty,
        correct: progress.correct,
        attempts: progress.attempts,
        timestamp: progress.timestamp || progress.createdAt
      }))
    };
  }

  private async getRetriesNeeded(userId: string) {
    const retries = await this.userProgressRepository.find({
      where: { userId, needsRetry: true, correct: false },
      relations: ['exercise'],
      order: { attempts: 'DESC' },
      take: 5
    });

    return retries.map(progress => ({
      exercise: progress.exercise,
      attempts: progress.attempts
    }));
  }

  private async getUserStats(userId: string) {
    const total = await this.userProgressRepository.count({
      where: { userId }
    });

    const correct = await this.userProgressRepository.count({
      where: { userId, correct: true }
    });

    return {
      total,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0
    };
  }

  private async fallbackRecommendation(
    srcLang: string,
    tgtLang: string,
    excludeTypes: string[],
    user: User
  ) {
    // Get user's completed exercises
    const completedExerciseIds = await this.userProgressRepository.find({
      where: { userId: user.id, correct: true },
      select: ['exerciseId']
    }).then(results => results.map(r => r.exerciseId));

    const where: any = {
      sourceLanguage: srcLang,
      targetLanguage: tgtLang,
      status: 'processed'
    };

    if (excludeTypes.length > 0) {
      where.exerciseType = Not(In(excludeTypes));
    }

    if (completedExerciseIds.length > 0) {
      where.id = Not(In(completedExerciseIds));
    }

    // Prefer user's current level, fallback to beginner
    const preferredDifficulties = [user.level, 'beginner', 'intermediate', 'advanced']
      .filter((value, index, self) => self.indexOf(value) === index);

    for (const difficulty of preferredDifficulties) {
      const exercise = await this.exerciseRepository.findOne({
        where: { ...where, difficulty },
        relations: ['translations', 'ttsEntries'],
        order: { createdAt: 'ASC' }
      });

      if (exercise) {
        return {
          exercise,
          reason: 'fallback',
          message: `Fallback recommendation based on user level: ${difficulty}.`
        };
      }
    }

    // No exercises found
    throw new NotFoundException({
      message: 'No suitable exercises found',
      details: 'All available exercises have been completed or excluded.'
    });
  }
}
