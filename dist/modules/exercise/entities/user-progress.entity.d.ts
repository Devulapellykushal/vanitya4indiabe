import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Exercise } from './exercise.entity';
export declare class UserProgress extends BaseEntity {
    userId: string;
    exerciseId: string;
    attempts: number;
    correct: boolean;
    lastAnswer: string;
    responseTimeMs: number;
    needsRetry: boolean;
    hintUsed: boolean;
    audioPlayed: boolean;
    isVoice: boolean;
    timestamp: Date;
    user: User;
    exercise: Exercise;
}
