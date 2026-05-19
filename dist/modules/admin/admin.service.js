"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entities/user.entity");
const exercise_entity_1 = require("../exercise/entities/exercise.entity");
const api_usage_entity_1 = require("../ai/entities/api-usage.entity");
let AdminService = class AdminService {
    constructor(configService, userRepository, exerciseRepository, apiUsageRepository) {
        this.configService = configService;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
        this.apiUsageRepository = apiUsageRepository;
    }
    async updateConfig(dto, userId) {
        const apiUsage = this.apiUsageRepository.create({
            provider: 'admin',
            endpoint: '/admin/config/update',
            creditsUsed: 0,
            responseStatus: 200,
            requestPayload: { updatedKeys: Object.keys(dto) },
            userId
        });
        await this.apiUsageRepository.save(apiUsage);
        return {
            message: 'Configuration updated successfully',
            updatedFields: Object.keys(dto)
        };
    }
    async getConfig() {
        const safeConfig = {
            DEFAULT_SOURCE_LANG: this.configService.get('DEFAULT_SOURCE_LANGUAGE'),
            DEFAULT_TARGET_LANG: this.configService.get('DEFAULT_TARGET_LANGUAGE'),
            SARVAM_FREE_CREDITS: this.configService.get('SARVAM_FREE_CREDITS'),
            SARVAM_API_URL: this.configService.get('SARVAM_API_URL'),
            ML_SERVICE_URL: this.configService.get('ML_SERVICE_URL'),
            NODE_ENV: this.configService.get('NODE_ENV'),
            SARVAM_API_KEY: this.configService.get('SARVAM_API_KEY') ? '***' : null,
            AI4BHARAT_API_KEY: this.configService.get('AI4BHARAT_API_KEY') ? '***' : null
        };
        return { config: safeConfig };
    }
    async getStats(timeframe = '24h') {
        const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        const totalUsers = await this.userRepository.count();
        const activeUsers = await this.userRepository.count({
            where: {
                isActive: true,
                lastActivity: (0, typeorm_2.MoreThanOrEqual)(since)
            }
        });
        const totalExercises = await this.exerciseRepository.count();
        const processedExercises = await this.exerciseRepository.count({
            where: { status: 'processed' }
        });
        const pendingExercises = await this.exerciseRepository.count({
            where: { status: 'pending' }
        });
        const apiStats = await Promise.all([
            this.getUsageStats('sarvam', since),
            this.getUsageStats('ai4bharat', since),
            this.getUsageStats('ml-service', since)
        ]);
        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : '0'
            },
            exercises: {
                total: totalExercises,
                processed: processedExercises,
                pending: pendingExercises,
                processedPercentage: totalExercises > 0
                    ? ((processedExercises / totalExercises) * 100).toFixed(2)
                    : '0'
            },
            apiUsage: {
                sarvam: apiStats[0],
                ai4bharat: apiStats[1],
                mlService: apiStats[2]
            },
            timeframe
        };
    }
    async getAPIAnalytics(provider, timeframe = '24h') {
        const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);
        if (provider) {
            const stats = await this.getUsageStats(provider, since);
            return { provider, stats, timeframe };
        }
        else {
            const providers = ['sarvam', 'ai4bharat', 'ml-service'];
            const allStats = {};
            for (const prov of providers) {
                allStats[prov] = await this.getUsageStats(prov, since);
            }
            return { stats: allStats, timeframe };
        }
    }
    async getUserAnalytics() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentUsers = await this.userRepository.find({
            where: {
                createdAt: (0, typeorm_2.MoreThanOrEqual)(thirtyDaysAgo)
            },
            select: ['id', 'createdAt', 'currentLanguage', 'targetLanguage', 'level']
        });
        const registrationTrends = recentUsers.reduce((acc, user) => {
            const date = user.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const languageStats = recentUsers.reduce((acc, user) => {
            const key = `${user.currentLanguage}_${user.targetLanguage}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const levelStats = recentUsers.reduce((acc, user) => {
            acc[user.level] = (acc[user.level] || 0) + 1;
            return acc;
        }, {});
        return {
            registrationTrends: Object.entries(registrationTrends).map(([date, count]) => ({
                date,
                count
            })),
            languagePreferences: Object.entries(languageStats).map(([key, count]) => {
                const [current, target] = key.split('_');
                return { currentLanguage: current, targetLanguage: target, count };
            }),
            levelDistribution: Object.entries(levelStats).map(([level, count]) => ({
                level,
                count
            }))
        };
    }
    async manageUsers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await this.userRepository.findAndCount({
            select: [
                'id',
                'email',
                'name',
                'provider',
                'level',
                'hearts',
                'streak',
                'isActive',
                'lastActivity',
                'createdAt'
            ],
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async updateUserStatus(userId, isActive) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });
        if (!user) {
            throw new Error('User not found');
        }
        user.isActive = isActive;
        await this.userRepository.save(user);
        return {
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user.id,
                email: user.email,
                isActive: user.isActive
            }
        };
    }
    async getUsageStats(provider, since) {
        const total = await this.apiUsageRepository.count({
            where: { provider, createdAt: (0, typeorm_2.MoreThanOrEqual)(since) }
        });
        const successful = await this.apiUsageRepository.count({
            where: {
                provider,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(since),
                responseStatus: 200
            }
        });
        const totalCredits = await this.apiUsageRepository
            .createQueryBuilder('usage')
            .select('SUM(usage.creditsUsed)', 'total')
            .where('usage.provider = :provider', { provider })
            .andWhere('usage.createdAt >= :since', { since })
            .getRawOne();
        return {
            total,
            successful,
            failed: total - successful,
            totalCredits: parseInt(totalCredits?.total || '0', 10),
            successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : '0'
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(3, (0, typeorm_1.InjectRepository)(api_usage_entity_1.ApiUsage)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map