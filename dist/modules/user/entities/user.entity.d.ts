import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiUsage } from '../../ai/entities/api-usage.entity';
import { UserProgress } from '../../exercise/entities/user-progress.entity';
import { RLState } from '../../recommender/entities/rl-state.entity';
export declare class User extends BaseEntity {
    email: string;
    name: string;
    password: string;
    provider: string;
    providerId: string;
    prefs: Record<string, any>;
    currentLanguage: string;
    targetLanguage: string;
    level: string;
    hearts: number;
    maxHearts: number;
    streak: number;
    lastActivity: Date;
    isAdmin: boolean;
    isActive: boolean;
    progress: UserProgress[];
    apiUsage: ApiUsage[];
    rlState: RLState;
    hashPassword(): Promise<void>;
    comparePassword(password: string): Promise<boolean>;
    updateActivity(): Promise<void>;
    useHeart(): Promise<boolean>;
    addHeart(): Promise<boolean>;
}
