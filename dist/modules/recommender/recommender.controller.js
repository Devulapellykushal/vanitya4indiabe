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
exports.RecommenderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recommender_service_1 = require("./recommender.service");
const next_exercise_dto_1 = require("./dto/next-exercise.dto");
const feedback_dto_1 = require("./dto/feedback.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let RecommenderController = class RecommenderController {
    constructor(recommenderService) {
        this.recommenderService = recommenderService;
    }
    async getNextExercise(dto, user) {
        return this.recommenderService.getNextExercise(user.id, dto);
    }
    async recordFeedback(dto, user) {
        return this.recommenderService.recordFeedback(user.id, dto);
    }
    async getAnalytics(user) {
        return this.recommenderService.getAnalytics(user.id);
    }
};
exports.RecommenderController = RecommenderController;
__decorate([
    (0, common_1.Get)('next'),
    (0, swagger_1.ApiOperation)({ summary: 'Get next recommended exercise' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exercise recommendation' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [next_exercise_dto_1.NextExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], RecommenderController.prototype, "getNextExercise", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, swagger_1.ApiOperation)({ summary: 'Record exercise outcome for RL learning' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feedback recorded successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feedback_dto_1.FeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], RecommenderController.prototype, "recordFeedback", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user learning analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Analytics data' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommenderController.prototype, "getAnalytics", null);
exports.RecommenderController = RecommenderController = __decorate([
    (0, swagger_1.ApiTags)('recommender'),
    (0, common_1.Controller)('recommender'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [recommender_service_1.RecommenderService])
], RecommenderController);
//# sourceMappingURL=recommender.controller.js.map