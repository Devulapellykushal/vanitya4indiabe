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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateExerciseDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GenerateExerciseDto {
    constructor() {
        this.count = 1;
    }
}
exports.GenerateExerciseDto = GenerateExerciseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'hi', description: 'Source language code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 10),
    __metadata("design:type", String)
], GenerateExerciseDto.prototype, "sourceLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'te', description: 'Target language code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 10),
    __metadata("design:type", String)
], GenerateExerciseDto.prototype, "targetLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'beginner', enum: ['beginner', 'intermediate', 'advanced'] }),
    (0, class_validator_1.IsIn)(['beginner', 'intermediate', 'advanced']),
    __metadata("design:type", String)
], GenerateExerciseDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'translation',
        enum: ['translation', 'transliteration', 'listening', 'speaking', 'matching']
    }),
    (0, class_validator_1.IsIn)(['translation', 'transliteration', 'listening', 'speaking', 'matching']),
    __metadata("design:type", String)
], GenerateExerciseDto.prototype, "exerciseType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'unit_1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateExerciseDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, minimum: 1, maximum: 50, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], GenerateExerciseDto.prototype, "count", void 0);
//# sourceMappingURL=generate-exercise.dto.js.map