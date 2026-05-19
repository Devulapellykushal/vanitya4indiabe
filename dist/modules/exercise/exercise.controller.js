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
exports.ExerciseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const exercise_service_1 = require("./exercise.service");
const fetch_exercises_dto_1 = require("./dto/fetch-exercises.dto");
const submit_exercise_dto_1 = require("./dto/submit-exercise.dto");
const generate_exercise_dto_1 = require("./dto/generate-exercise.dto");
const generate_audio_dto_1 = require("./dto/generate-audio.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ExerciseController = class ExerciseController {
    constructor(exerciseService) {
        this.exerciseService = exerciseService;
    }
    async fetchExercises(dto, user) {
        return this.exerciseService.fetchExercises(user.id, dto);
    }
    async submitExercise(dto, user) {
        return this.exerciseService.submitExercise(user.id, dto);
    }
    async generateExercises(dto, user) {
        return this.exerciseService.generateExercises(user.id, dto);
    }
    async generateAudio(id, dto, user) {
        return this.exerciseService.generateAudio(id, dto);
    }
    async getExercise(id, user) {
        return this.exerciseService.getExercise(id, user.id);
    }
};
exports.ExerciseController = ExerciseController;
__decorate([
    (0, common_1.Get)('fetch'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch exercises for user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exercises fetched successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fetch_exercises_dto_1.FetchExercisesDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "fetchExercises", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit exercise answer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Answer submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No hearts remaining' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_exercise_dto_1.SubmitExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "submitExercise", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Generate new exercises' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Exercises generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_exercise_dto_1.GenerateExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "generateExercises", null);
__decorate([
    (0, common_1.Post)(':id/audio'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate audio for exercise' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audio generated successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_audio_dto_1.GenerateAudioDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "generateAudio", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exercise by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exercise retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Exercise not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getExercise", null);
exports.ExerciseController = ExerciseController = __decorate([
    (0, swagger_1.ApiTags)('exercises'),
    (0, common_1.Controller)('exercises'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [exercise_service_1.ExerciseService])
], ExerciseController);
//# sourceMappingURL=exercise.controller.js.map