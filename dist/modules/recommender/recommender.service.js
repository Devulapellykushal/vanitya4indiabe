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
exports.RecommenderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entities/user.entity");
const exercise_entity_1 = require("../exercise/entities/exercise.entity");
const user_progress_entity_1 = require("../exercise/entities/user-progress.entity");
const rl_state_entity_1 = require("./entities/rl-state.entity");
let RecommenderService = class RecommenderService {
    constructor(userRepository, exerciseRepository, userProgressRepository, rlStateRepository) {
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
        this.userProgressRepository = userProgressRepository;
        this.rlStateRepository = rlStateRepository;
    }
    async getNextExercise(userId, dto) {
        const { sourceLanguage, targetLanguage, excludeTypes = [] } = dto;
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true },
            relations: ['rlState']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const srcLang = sourceLanguage || user.currentLanguage;
        const tgtLang = targetLanguage || user.targetLanguage;
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
        const selectedArm = rlState && typeof rlState.selectArm === 'function'
            ? rlState.selectArm()
            : null;
        if (!selectedArm) {
            return this.fallbackRecommendation(srcLang, tgtLang, excludeTypes, user);
        }
        const [exerciseType, difficulty] = selectedArm.split('_');
        if (excludeTypes.includes(exerciseType)) {
            return this.fallbackRecommendation(srcLang, tgtLang, excludeTypes, user);
        }
        const completedExerciseIds = await this.userProgressRepository.find({
            where: { userId, correct: true },
            select: ['exerciseId']
        }).then(results => results.map(r => r.exerciseId));
        const where = {
            sourceLanguage: srcLang,
            targetLanguage: tgtLang,
            exerciseType,
            difficulty,
            status: 'processed'
        };
        if (completedExerciseIds.length > 0) {
            where.id = (0, typeorm_2.Not)((0, typeorm_2.In)(completedExerciseIds));
        }
        const recommendedExercise = await this.exerciseRepository.findOne({
            where,
            relations: ['translations', 'ttsEntries'],
            order: { createdAt: 'ASC' }
        });
        if (!recommendedExercise) {
            return this.fallbackRecommendation(srcLang, tgtLang, excludeTypes, user);
        }
        return {
            exercise: recommendedExercise,
            reason: 'rl_recommendation',
            message: 'Recommended based on RL algorithm.',
            selectedArm
        };
    }
    async recordFeedback(userId, dto) {
        const { exerciseId, exerciseType, difficulty, correct, responseTime } = dto;
        const rlState = await this.rlStateRepository.findOne({
            where: { userId }
        });
        if (!rlState) {
            throw new common_1.NotFoundException('RL state not found for user');
        }
        let reward = correct ? 1 : 0;
        if (correct && responseTime && responseTime < 10000) {
            reward += 0.2;
        }
        if (responseTime && responseTime > 60000) {
            reward -= 0.1;
        }
        reward = Math.max(0, Math.min(1, reward));
        const arm = `${exerciseType}_${difficulty}`;
        rlState.lastUpdated = new Date();
        await this.rlStateRepository.save(rlState);
        return {
            message: 'Feedback recorded successfully',
            arm,
            reward
        };
    }
    async getAnalytics(userId) {
        const rlState = await this.rlStateRepository.findOne({
            where: { userId }
        });
        if (!rlState) {
            throw new common_1.NotFoundException('RL state not found for user');
        }
        const userStats = await this.getUserStats(userId);
        const recentProgress = await this.userProgressRepository.find({
            where: { userId },
            relations: ['exercise'],
            order: { timestamp: 'DESC' },
            take: 10
        });
        return {
            rlState: {
                algorithm: 'epsilon-greedy',
                totalPulls: 0,
                epsilon: 0.1,
                armStats: []
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
    async getRetriesNeeded(userId) {
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
    async getUserStats(userId) {
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
    async fallbackRecommendation(srcLang, tgtLang, excludeTypes, user) {
        const completedExerciseIds = await this.userProgressRepository.find({
            where: { userId: user.id, correct: true },
            select: ['exerciseId']
        }).then(results => results.map(r => r.exerciseId));
        const where = {
            sourceLanguage: srcLang,
            targetLanguage: tgtLang,
            status: 'processed'
        };
        if (excludeTypes.length > 0) {
            where.exerciseType = (0, typeorm_2.Not)((0, typeorm_2.In)(excludeTypes));
        }
        if (completedExerciseIds.length > 0) {
            where.id = (0, typeorm_2.Not)((0, typeorm_2.In)(completedExerciseIds));
        }
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
        throw new common_1.NotFoundException({
            message: 'No suitable exercises found',
            details: 'All available exercises have been completed or excluded.'
        });
    }
};
exports.RecommenderService = RecommenderService;
exports.RecommenderService = RecommenderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(2, (0, typeorm_1.InjectRepository)(user_progress_entity_1.UserProgress)),
    __param(3, (0, typeorm_1.InjectRepository)(rl_state_entity_1.RLState)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RecommenderService);
//# sourceMappingURL=recommender.service.js.map