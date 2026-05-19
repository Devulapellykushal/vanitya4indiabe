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
exports.SttController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const throttler_1 = require("@nestjs/throttler");
const stt_service_1 = require("./stt.service");
const submit_audio_dto_1 = require("./dto/submit-audio.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SttController = class SttController {
    constructor(sttService) {
        this.sttService = sttService;
    }
    async submitAudio(file, dto, user) {
        return this.sttService.processAudio(file, dto.language, dto.exerciseId);
    }
    getSupportedLanguages() {
        return this.sttService.getSupportedLanguages();
    }
};
exports.SttController = SttController;
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Submit audio for speech-to-text' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                audio: {
                    type: 'string',
                    format: 'binary'
                },
                language: {
                    type: 'string',
                    example: 'hi'
                },
                exerciseId: {
                    type: 'string',
                    format: 'uuid'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audio processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Audio file is required' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_audio_dto_1.SubmitAudioDto, Object]),
    __metadata("design:returntype", Promise)
], SttController.prototype, "submitAudio", null);
__decorate([
    (0, common_1.Get)('languages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get supported languages for STT' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supported languages' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SttController.prototype, "getSupportedLanguages", null);
exports.SttController = SttController = __decorate([
    (0, swagger_1.ApiTags)('stt'),
    (0, common_1.Controller)('stt'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [stt_service_1.SttService])
], SttController);
//# sourceMappingURL=stt.controller.js.map