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
exports.SttService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exercise_entity_1 = require("../exercise/entities/exercise.entity");
const ai_service_1 = require("../ai/ai.service");
const fs = require("fs");
let SttService = class SttService {
    constructor(exerciseRepository, aiService) {
        this.exerciseRepository = exerciseRepository;
        this.aiService = aiService;
    }
    async processAudio(file, language, exerciseId) {
        if (!file) {
            throw new common_1.BadRequestException('Audio file is required');
        }
        try {
            const sttResult = await this.aiService.speechToText({
                audioFile: file,
                language
            });
            try {
                fs.unlinkSync(file.path);
            }
            catch (cleanupError) {
                console.warn('Failed to cleanup uploaded file:', cleanupError);
            }
            const response = {
                text: sttResult.text,
                confidence: sttResult.confidence,
                language,
                processingTime: sttResult.processing_time_ms || sttResult.processingTime
            };
            if (exerciseId) {
                const exercise = await this.exerciseRepository.findOne({
                    where: { id: exerciseId }
                });
                if (exercise) {
                    const isMatch = sttResult.text.toLowerCase().trim() ===
                        exercise.correctAnswer.toLowerCase().trim();
                    response.matchesExpected = isMatch;
                    response.expectedAnswer = exercise.correctAnswer;
                }
            }
            return response;
        }
        catch (error) {
            try {
                if (file?.path) {
                    fs.unlinkSync(file.path);
                }
            }
            catch (cleanupError) {
                console.warn('Failed to cleanup uploaded file:', cleanupError);
            }
            console.error('STT processing error:', error);
            throw new common_1.InternalServerErrorException({
                message: 'Failed to process audio',
                details: error.message
            });
        }
    }
    getSupportedLanguages() {
        return {
            languages: [
                { code: 'hi', name: 'Hindi' },
                { code: 'te', name: 'Telugu' },
                { code: 'ta', name: 'Tamil' },
                { code: 'bn', name: 'Bengali' },
                { code: 'gu', name: 'Gujarati' },
                { code: 'kn', name: 'Kannada' },
                { code: 'ml', name: 'Malayalam' },
                { code: 'mr', name: 'Marathi' },
                { code: 'or', name: 'Odia' },
                { code: 'pa', name: 'Punjabi' },
                { code: 'ur', name: 'Urdu' },
                { code: 'en', name: 'English' }
            ]
        };
    }
};
exports.SttService = SttService;
exports.SttService = SttService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exercise_entity_1.Exercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ai_service_1.AiService])
], SttService);
//# sourceMappingURL=stt.service.js.map