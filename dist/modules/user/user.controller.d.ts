import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(user: any): Promise<{
        user: {
            email: string;
            name: string;
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
            progress: import("../exercise/entities/user-progress.entity").UserProgress[];
            apiUsage: import("../ai/entities/api-usage.entity").ApiUsage[];
            rlState: import("../recommender/entities/rl-state.entity").RLState;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date;
        };
    }>;
    updateProfile(dto: UpdateProfileDto, user: any): Promise<{
        message: string;
        user: {
            email: string;
            name: string;
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
            progress: import("../exercise/entities/user-progress.entity").UserProgress[];
            apiUsage: import("../ai/entities/api-usage.entity").ApiUsage[];
            rlState: import("../recommender/entities/rl-state.entity").RLState;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt?: Date;
        };
    }>;
}
