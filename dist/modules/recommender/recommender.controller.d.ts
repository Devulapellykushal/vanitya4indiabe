import { RecommenderService } from './recommender.service';
import { NextExerciseDto } from './dto/next-exercise.dto';
import { FeedbackDto } from './dto/feedback.dto';
export declare class RecommenderController {
    private readonly recommenderService;
    constructor(recommenderService: RecommenderService);
    getNextExercise(dto: NextExerciseDto, user: any): Promise<{
        exercise: import("../exercise/entities/exercise.entity").Exercise;
        reason: string;
        message: string;
    } | {
        exercise: import("../exercise/entities/exercise.entity").Exercise;
        reason: string;
        message: string;
        retryAttempt: number;
        selectedArm?: undefined;
    } | {
        exercise: import("../exercise/entities/exercise.entity").Exercise;
        reason: string;
        message: string;
        selectedArm: string;
        retryAttempt?: undefined;
    }>;
    recordFeedback(dto: FeedbackDto, user: any): Promise<{
        message: string;
        arm: string;
        reward: number;
    }>;
    getAnalytics(user: any): Promise<{
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
}
