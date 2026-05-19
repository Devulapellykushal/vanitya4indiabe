import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Exercise } from '../exercise/entities/exercise.entity';
import { ApiUsage } from '../ai/entities/api-usage.entity';
import { UpdateConfigDto } from './dto/update-config.dto';
export declare class AdminService {
    private configService;
    private userRepository;
    private exerciseRepository;
    private apiUsageRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>, exerciseRepository: Repository<Exercise>, apiUsageRepository: Repository<ApiUsage>);
    updateConfig(dto: UpdateConfigDto, userId: string): Promise<{
        message: string;
        updatedFields: string[];
    }>;
    getConfig(): Promise<{
        config: {
            DEFAULT_SOURCE_LANG: any;
            DEFAULT_TARGET_LANG: any;
            SARVAM_FREE_CREDITS: any;
            SARVAM_API_URL: any;
            ML_SERVICE_URL: any;
            NODE_ENV: any;
            SARVAM_API_KEY: string;
            AI4BHARAT_API_KEY: string;
        };
    }>;
    getStats(timeframe?: string): Promise<{
        users: {
            total: number;
            active: number;
            activePercentage: string;
        };
        exercises: {
            total: number;
            processed: number;
            pending: number;
            processedPercentage: string;
        };
        apiUsage: {
            sarvam: {
                total: number;
                successful: number;
                failed: number;
                totalCredits: number;
                successRate: string;
            };
            ai4bharat: {
                total: number;
                successful: number;
                failed: number;
                totalCredits: number;
                successRate: string;
            };
            mlService: {
                total: number;
                successful: number;
                failed: number;
                totalCredits: number;
                successRate: string;
            };
        };
        timeframe: string;
    }>;
    getAPIAnalytics(provider?: string, timeframe?: string): Promise<{
        provider: string;
        stats: {
            total: number;
            successful: number;
            failed: number;
            totalCredits: number;
            successRate: string;
        };
        timeframe: string;
    } | {
        stats: {};
        timeframe: string;
        provider?: undefined;
    }>;
    getUserAnalytics(): Promise<{
        registrationTrends: {
            date: string;
            count: unknown;
        }[];
        languagePreferences: {
            currentLanguage: string;
            targetLanguage: string;
            count: unknown;
        }[];
        levelDistribution: {
            level: string;
            count: unknown;
        }[];
    }>;
    manageUsers(page?: number, limit?: number): Promise<{
        users: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    updateUserStatus(userId: string, isActive: boolean): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            isActive: boolean;
        };
    }>;
    private getUsageStats;
}
