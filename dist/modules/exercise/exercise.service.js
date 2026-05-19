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
exports.ExerciseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_service_1 = require("../ai/ai.service");
const user_entity_1 = require("../user/entities/user.entity");
const exercise_entity_1 = require("./entities/exercise.entity");
const tts_entry_entity_1 = require("./entities/tts-entry.entity");
const user_progress_entity_1 = require("./entities/user-progress.entity");
let ExerciseService = class ExerciseService {
    constructor(exerciseRepository, userProgressRepository, userRepository, ttsEntryRepository, aiService) {
        this.exerciseRepository = exerciseRepository;
        this.userProgressRepository = userProgressRepository;
        this.userRepository = userRepository;
        this.ttsEntryRepository = ttsEntryRepository;
        this.aiService = aiService;
    }
    async fetchExercises(userId, dto) {
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = dto;
        const skip = (page - 1) * limit;
        const sortByMap = {
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
        const where = {
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
        exercises.forEach(exercise => {
            exercise.userProgress = exercise.userProgress?.filter(progress => progress.userId === userId) || [];
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
    async submitExercise(userId, dto) {
        const { exerciseId, answer, responseTime, hintUsed = false, audioPlayed = false } = dto;
        const exercise = await this.exerciseRepository.findOne({
            where: { id: exerciseId }
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
        let heartUsed = false;
        if (!isCorrect) {
            const heartUsedSuccessfully = await user.useHeart();
            heartUsed = heartUsedSuccessfully;
            if (!heartUsedSuccessfully) {
                throw new common_1.BadRequestException({
                    message: 'No hearts remaining',
                    heartsRemaining: user.hearts
                });
            }
            await this.userRepository.save(user);
        }
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
        userProgress.attempts += 1;
        userProgress.correct = isCorrect;
        userProgress.lastAnswer = answer;
        userProgress.responseTimeMs = responseTime;
        userProgress.needsRetry = !isCorrect;
        if (hintUsed)
            userProgress.hintUsed = true;
        if (audioPlayed)
            userProgress.audioPlayed = true;
        await this.userProgressRepository.save(userProgress);
        if (isCorrect) {
            user.streak += 1;
        }
        else if (userProgress.attempts === 1) {
            user.streak = 0;
        }
        await this.userRepository.save(user);
        const response = {
            correct: isCorrect,
            attempts: userProgress.attempts,
            explanation: isCorrect ? null : exercise.explanation,
            correctAnswer: isCorrect ? null : exercise.correctAnswer,
            heartUsed,
            heartsRemaining: user.hearts,
            streak: user.streak
        };
        if (!isCorrect && user.hearts > 0) {
            response.canRetry = true;
            response.hint = exercise.hint;
        }
        return response;
    }
    async generateExercises(userId, dto) {
        const { sourceLanguage, targetLanguage, difficulty, exerciseType, unitId, count = 1 } = dto;
        try {
            const generatedExercises = await this.aiService.generateExercises({
                sourceLanguage,
                targetLanguage,
                difficulty,
                exerciseType,
                unitId,
                count
            });
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
            }
            return {
                message: `${exercises.length} exercises generated successfully`,
                exercises,
                processingStatus: 'Translations and audio generation queued'
            };
        }
        catch (error) {
            console.error('Exercise generation error:', error);
            throw new common_1.InternalServerErrorException({
                message: 'Failed to generate exercises',
                details: error.message
            });
        }
    }
    async generateAudio(exerciseId, dto) {
        const { text, language } = dto;
        const exercise = await this.exerciseRepository.findOne({
            where: { id: exerciseId }
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        try {
            const ttsResult = await this.aiService.generateTTS({
                text,
                language
            });
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
        }
        catch (error) {
            console.error('Audio generation error:', error);
            throw new common_1.InternalServerErrorException({
                message: 'Failed to generate audio',
                details: error.message
            });
        }
    }
    async getExercise(exerciseId, userId) {
        const exercise = await this.exerciseRepository.findOne({
            where: { id: exerciseId },
            relations: ['userProgress', 'translations', 'transliterations', 'ttsEntries']
        });
        if (!exercise) {
            throw new common_1.NotFoundException('Exercise not found');
        }
        exercise.userProgress = exercise.userProgress?.filter(progress => progress.userId === userId) || [];
        return { exercise };
    }
};
exports.ExerciseService = ExerciseService;
exports.ExerciseService = ExerciseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __param(1, (0, typeorm_1.InjectRepository)(user_progress_entity_1.UserProgress)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(tts_entry_entity_1.TTSEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService])
], ExerciseService);
//# sourceMappingURL=exercise.service.js.map