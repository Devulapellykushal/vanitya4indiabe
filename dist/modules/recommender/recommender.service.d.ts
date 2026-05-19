import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { UserProgress } from '../exercise/entities/user-progress.entity';
import { RLState } from './entities/rl-state.entity';
import { NextExerciseDto } from './dto/next-exercise.dto';
import { FeedbackDto } from './dto/feedback.dto';
export declare class RecommenderService {
    private userRepository;
    private exerciseRepository;
    private userProgressRepository;
    private rlStateRepository;
    constructor(userRepository: Repository<User>, exerciseRepository: Repository<Exercise>, userProgressRepository: Repository<UserProgress>, rlStateRepository: Repository<RLState>);
    getNextExercise(userId: string, dto: NextExerciseDto): Promise<{
        exercise: Exercise;
        reason: string;
        message: string;
    } | {
        exercise: Exercise;
        reason: string;
        message: string;
        retryAttempt: number;
        selectedArm?: undefined;
    } | {
        exercise: Exercise;
        reason: string;
        message: string;
        selectedArm: string;
        retryAttempt?: undefined;
    }>;
    recordFeedback(userId: string, dto: FeedbackDto): Promise<{
        message: string;
        arm: string;
        reward: number;
    }>;
    getAnalytics(userId: string): Promise<{
        rlState: {
            algorithm: string;
            totalPulls: number;
            epsilon: number;
            armStats: any[];
        };
        userStats: {
            total: number;
            correct: number;
            accuracy: number;
        };
        recentProgress: {
            exerciseType: string;
            difficulty: string;
            correct: boolean;
            attempts: number;
            timestamp: Date;
        }[];
    }>;
    private getRetriesNeeded;
    private getUserStats;
    private fallbackRecommendation;
}
